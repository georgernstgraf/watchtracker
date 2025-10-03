"use strict";

import express from "express";
import { session } from "./lib/session.ts";
import httpErrors from "http-errors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { engine as exphbs } from "express-handlebars";
import expressStaticGzip from "express-static-gzip";
import bodyParser from "body-parser";
import prisma from "./lib/db.ts";
import process from "node:process";
import sessionRoutes from "./lib/sessionRoutes.ts";
import enforceUser from "./lib/enforceUser.ts";
import authRoutes from "./lib/authRoutes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface MainOptions {
    host?: string;
    port?: number;
}

export function main(options: MainOptions) {
    // Set default options
    const opts = Object.assign(
        {
            host: "localhost",
            port: 8000,
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
    if (Deno.env.get("NODE_ENV") === "production") {
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
                    const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sept",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
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
        res.locals.appPath = Deno.env.get("APP_PATH");
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
    app.use(Deno.env.get("APP_PATH") || "", sessionRouter);
    app.use(`${Deno.env.get("APP_PATH") || ""}/auth`, authRouter);

    // static files
    app.use(
        Deno.env.get("APP_PATH") || "",
        expressStaticGzip(path.join(__dirname, "static"), {}),
    );
    app.use(Deno.env.get("APP_PATH") || "", express.static(path.join(__dirname, "static")));

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
    const server = app.listen(opts.port, opts.host, function (err: NodeJS.ErrnoException) {
        if (err) {
            console.error(`❌ Failed to start server on ${opts.host}:${opts.port}`);

            if (err.code === "EADDRINUSE") {
                console.error(`❌ Port ${opts.port} is already in use on ${opts.host}`);
                console.error(`   Please choose a different port or stop the service using this port`);
                console.error(`   You can check what's using the port with: lsof -i :${opts.port}`);
            } else if (err.code === "EACCES") {
                console.error(`❌ Permission denied to bind to port ${opts.port} on ${opts.host}`);
                console.error(`   You may need elevated privileges to bind to this port`);
            } else if (err.code === "EADDRNOTAVAIL") {
                console.error(`❌ Address ${opts.host}:${opts.port} is not available`);
                console.error(`   Please check if the host address is valid`);
            } else {
                console.error(`❌ Server error: ${err.message}`);
                console.error(`   Error code: ${err.code || "UNKNOWN"}`);
            }

            console.error(`\n💥 Server startup failed. Exiting...`);
            process.exit(1);
        }
        // If some other error means we should close
        if (serverClosing) {
            const closeError = new Error("Server was closed before it could start");
            console.error(closeError.message);
            return;
        }
        serverStarted = true;
        const addr = server.address();
        console.info(
            `✅ Server started successfully at http://${opts.host || addr.host || "localhost"}:${addr.port}${Deno.env.get("APP_PATH") || ""} ${
                new Date().toLocaleTimeString()
            }`,
        );
    });

    // Handle server errors (like port binding failures)
    server.on("error", function (err: NodeJS.ErrnoException) {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${opts.port} is already in use on ${opts.host}`);
            console.error(`Cannot bind to address ${opts.host}:${opts.port}`);
            console.error("Please choose a different port or stop the service using this port");
        } else if (err.code === "EACCES") {
            console.error(`Permission denied to bind to port ${opts.port} on ${opts.host}`);
            console.error("You may need elevated privileges to bind to this port");
        } else if (err.code === "EADDRNOTAVAIL") {
            console.error(`Address ${opts.host}:${opts.port} is not available`);
            console.error("Please check if the host address is valid");
        } else {
            console.error(`Server error occurred while trying to start on ${opts.host}:${opts.port}`);
            console.error(`Error code: ${err.code}`);
            console.error(`Error message: ${err.message}`);
        }
        console.error("Server startup failed. Exiting...");
        process.exit(1);
    });
    process.on("SIGTERM", async () => {
        console.log("SIGTERM received");
        await prisma.$disconnect();
        console.log("disconnected prisma, exiting normally.");
        process.exit();
    });
}
