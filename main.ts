"use strict";

import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { prisma } from "./lib/db.ts";
import { sessionRouter } from "./routers/sessionRouter.ts";
import { authRouter } from "./routers/authRouter.ts";
import * as config from "./lib/config.ts";
import { Session } from "./middleware/session.ts";
import process from "node:process";

function main() {
    const listen_host = config.APP_HOST;
    const listen_port = config.APP_PORT;

    let serverStarted = false;
    let serverClosing = false;

    function unhandledError(err: Error) {
        console.error(`unhandled error: ${err.message}, obj:`, err);
        if (serverClosing) {
            console.error("Server is already closing, ignoring.");
            return;
        }
        serverClosing = true;
        if (serverStarted) {
            console.error("Shutting down server due to unhandled error...");
            process.exit(1);
        }
    }
    process.on("uncaughtException", unhandledError);
    process.on("unhandledRejection", unhandledError);

    // Create the Hono app
    const app = new Hono();

    //    app.use("*", session);
    app.use((c, next) => Session.middleware(c, next));

    // Static files - must come before routers to serve files from /watchtracker/static/*
    app.use(
        `${config.APP_PATH}/*`,
        serveStatic({ root: "./static", rewriteRequestPath: (path) => path.replace(config.APP_PATH, "") }),
    );

    // Mount routers
    app.route(config.APP_PATH, sessionRouter);
    app.route(`${config.APP_PATH}/auth`, authRouter);

    // 404 handler
    app.notFound((c) => {
        return c.text(`Route not found: ${c.req.url}`, 404);
    });

    // Error handler
    app.onError((err, c) => {
        console.error(`Error: ${err.message}`);
        if (config.DENO_ENV === "development") {
            console.error(err);
        }
        const status = (err as Error & { status?: number }).status || 500;
        return c.text(err.message, status as 500);
    });

    // Start server
    console.log(`Starting server on ${listen_host}:${listen_port}${config.APP_PATH}...`);

    Deno.serve({
        port: listen_port,
        hostname: listen_host,
        onListen: ({ hostname, port }) => {
            serverStarted = true;
            console.info(
                `✅ Server started successfully at http://${hostname}:${port}${config.APP_PATH} ${new Date().toLocaleTimeString()}`,
            );
        },
    }, app.fetch);

    process.on("SIGTERM", async () => {
        console.log("SIGTERM received");
        await prisma.$disconnect();
        console.log("disconnected prisma, exiting normally.");
        Deno.exit();
    });
}

main();
