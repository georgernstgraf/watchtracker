"use strict";

// import express from "express";
// import { engine } from "../../dist/index.js"; // "express-handlebars"
//
// import * as path from "path";
// import { fileURLToPath } from "url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

import express from "express";
import { session } from "./lib/session.ts";
import httpErrors from "http-errors";
import path from "node:path";
import { engine as exphbs } from "express-handlebars";
import expressStaticGzip from "express-static-gzip";
import bodyParser from "body-parser";
import prisma from "./lib/db.ts";
import process from "node:process";
import sessionRoutes from "./lib/sessionRoutes.ts";
import enforceUser from "./lib/enforceUser.ts";
import authRoutes from "./lib/authRoutes.ts";

export function main(options: unknown) {
    // Set default options
    const ready = function () {};
    const opts = Object.assign(
        {
            // Default options
        },
        options,
    );
    // Server state
    let serverStarted = false;
    let serverClosing = false;
    // Setup error handling
    function unhandledError(err: Error) {
        // Log the errors
        console.error(err);
        /* console.error('NOT RESTARTING!');
        return;
        */
        // Only clean up once
        if (serverClosing) {
            return;
        }
        serverClosing = true;
        // If server has started, close it down
        if (serverStarted) {
            server.close(() => {
                process.exit(1);
            });
        }
    }
    process.on("uncaughtException", unhandledError);
    process.on("unhandledRejection", unhandledError);
    // Create the express app
    const app = express();
    // Template engine
    if (process.env.NODE_ENV === "production") {
        app.set("trust proxy", "loopback");
    }

    app.engine(
        "hbs",
        exphbs({
            extname: ".hbs",
            partialsDir: path.join(__dirname, "views"),
            runtimeOptions: { allowProtoPropertiesByDefault: true },
            helpers: {
                let: function (options: any) {
                    const context = Object.assign({}, this, options.hash);
                    return options.fn(context);
                },
                or: function () {
                    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
                },
                //   and: function () {
                //     return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
                // },
                not: function (value: any) {
                    return !value;
                },
                eq: function (a: any, b: any) {
                    return a === b;
                },
                formatDate: function (dateString: string) {
                    const date = new Date(dateString);
                    const day = date.getDate();
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
                    const month = monthNames[date.getMonth()];
                    const hours = date.getHours().toString().padStart(2, "0");
                    const minutes = date.getMinutes().toString().padStart(2, "0");
                    return `${day}. ${month}, ${hours}:${minutes}`;
                },
                plusOne: function (val: number) {
                    if (val == 0) return 1;
                    return val;
                },
            },
        }),
    );
    app.set("view engine", "hbs");
    app.set("views", path.join(__dirname, "views"));
    app.locals.layout = false;

    // router with sessions, no auth enforced:
    const sessionRouter = express.Router();
    sessionRouter.use(bodyParser.urlencoded({ extended: true }));
    sessionRouter.use(session);
    sessionRouter.use((req: any, res: any, next: any) => {
        res.locals.appPath = process.env.APP_PATH;
        next();
    });
    sessionRoutes(sessionRouter, opts); // calls .use() several times on the sessionRouter

    // setting up the authRouter
    const authRouter = express.Router();
    authRouter.use(bodyParser.urlencoded({ extended: true }));
    authRouter.use(session);
    authRouter.use(enforceUser);
    authRoutes(authRouter, opts); // calls .use() several times on the authRouter

    // USE all this routers in the app:

    // rendered
    app.use(process.env.APP_PATH, sessionRouter);
    app.use(`${process.env.APP_PATH}/auth`, authRouter);

    // static files
    app.use(process.env.APP_PATH, expressStaticGzip(path.join(__dirname, "static"), {}));
    app.use(process.env.APP_PATH, express.static(path.join(__dirname, "static")));

    // Common error handlers
    app.use(function fourOhFourHandler(req: any, res: any, next: any) {
        next(httpErrors(404, `Route not found: ${req.url}`));
    });
    app.use(function fiveHundredHandler(err: any, req: any, res: any, next: any) {
        if (err.status >= 500) {
            console.error(err);
        }
        console.error(`fiveHundred activated: ${err} (${err.status})`);
        res.locals.error = err;
        res.set("Content-Type", "text/plain");
        res.status(err.status || 500).send(err.message);
    });
    // Start server
    const server = app.listen(opts.port, opts.host, function (err: any) {
        if (err) {
            return ready(err, app, server);
        }
        // If some other error means we should close
        if (serverClosing) {
            return ready(new Error("Server was closed before it could start"));
        }
        serverStarted = true;
        const addr = server.address();
        console.info(
            `Started at http://${opts.host || addr.host || "localhost"}:${addr.port}${process.env.APP_PATH} ${new Date().toLocaleTimeString()}`,
        );
        ready(err, app, server);
    });
    process.on("SIGTERM", async () => {
        console.log("SIGTERM received");
        await prisma.$disconnect();
        console.log("disconnected prisma, exiting normally.");
        process.exit();
    });
}
