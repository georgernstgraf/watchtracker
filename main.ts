"use strict";

import express from "express";
import session from "./middleware/session.ts";
import httpErrors from "http-errors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { engine as exphbs } from "express-handlebars";
import expressStaticGzip from "express-static-gzip";
import prisma from "./lib/db.ts";
import process from "node:process";
import sessionRouter from "./routers/sessionRouter.ts";
import authRouter from "./routers/authRouter.ts";
import { HelperOptions } from "handlebars";
import * as config from "./lib/config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface MainOptions {
    host?: string;
    port?: number;
}

function main() {
    const listen_host = config.APP_HOST;
    const listen_port = config.APP_PORT;

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
    if (config.NODE_ENV === "production") {
        app.set("trust proxy", "loopback");
    }

    // initialize handlebars renderer
    app.engine(
        "hbs",
        exphbs({
            extname: ".hbs",
            partialsDir: path.join(__dirname, "views"),
            runtimeOptions: { allowProtoPropertiesByDefault: true },
            helpers: {
                let: function (options: HelperOptions) {
                    const context = Object.assign({}, this, options.hash);
                    return options.fn(context);
                },
                or: function (...args: unknown[]) {
                    return args.slice(0, -1).some(Boolean);
                },
                not: function (value: unknown) {
                    return !value;
                },
                eq: function (a: unknown, b: unknown) {
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
    app.use(config.APP_PATH, sessionRouter);

    // setting up the authRouter
    app.use(`${config.APP_PATH}/auth`, authRouter);

    // static files - zip first
    app.use(
        config.APP_PATH,
        expressStaticGzip(path.join(__dirname, "static"), {}),
    );
    // static files uncompressed
    app.use(config.APP_PATH, express.static(path.join(__dirname, "static")));

    // 404 handler
    app.use(function fourOhFourHandler(req: express.Request, _res: express.Response, next: express.NextFunction) {
        next(httpErrors(404, `Route not found: ${req.url}`));
    });
    // 500 handler
    app.use(
        function fiveHundredHandler(
            err: Error & { status?: number; statusCode?: number },
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction,
        ) {
            console.error(`fiveHundred activated: ${err} (${err.status || err.statusCode})`);
            res.locals.error = err;
            res.set("Content-Type", "text/plain");
            res.status(err.status || err.statusCode || 500).send(err.message);
        },
    );
    // Start server
    const server = app.listen(listen_port, listen_host, function (err: NodeJS.ErrnoException) {
        if (err) {
            console.error(`❌ Failed to start server on ${listen_host}:${listen_port}`);

            if (err.code === "EADDRINUSE") {
                console.error(`❌ Port ${listen_port} is already in use on ${listen_host}`);
                console.error(`   Please choose a different port or stop the service using this port`);
                console.error(`   You can check what's using the port with: lsof -i :${listen_port}`);
            } else if (err.code === "EACCES") {
                console.error(`❌ Permission denied to bind to port ${listen_port} on ${listen_host}`);
                console.error(`   You may need elevated privileges to bind to this port`);
            } else if (err.code === "EADDRNOTAVAIL") {
                console.error(`❌ Address ${listen_host}:${listen_port} is not available`);
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
            `✅ Server started successfully at http://${listen_host || addr.host || "localhost"}:${addr.port}${config.APP_PATH} ${
                new Date().toLocaleTimeString()
            }`,
        );
    });

    // Handle server errors (like port binding failures)
    server.on("error", function (err: NodeJS.ErrnoException) {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${listen_port} is already in use on ${listen_host}`);
            console.error(`Cannot bind to address ${listen_host}:${listen_port}`);
            console.error("Please choose a different port or stop the service using this port");
        } else if (err.code === "EACCES") {
            console.error(`Permission denied to bind to port ${listen_port} on ${listen_host}`);
            console.error("You may need elevated privileges to bind to this port");
        } else if (err.code === "EADDRNOTAVAIL") {
            console.error(`Address ${listen_host}:${listen_port} is not available`);
            console.error("Please check if the host address is valid");
        } else {
            console.error(`Server error occurred while trying to start on ${listen_host}:${listen_port}`);
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

main();
