"use strict";

import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { serveStatic } from "hono/deno";
import { prisma } from "./lib/db.ts";
import { renderError, renderErrorFull } from "./lib/views.ts";
import { sessionRouter } from "./routers/sessionRouter.ts";
import { authRouter } from "./routers/authRouter.ts";
import * as config from "./lib/config.ts";
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

    // Trim trailing slashes - redirect /watchtracker/ to /watchtracker
    app.use(async (c, next) => {
        const path = c.req.path;
        if (path !== "/" && path.endsWith("/")) {
            const newPath = path.slice(0, -1);
            const query = c.req.url.includes("?") ? c.req.url.split("?")[1] : "";
            return c.redirect(query ? `${newPath}?${query}` : newPath, 301);
        }
        await next();
    });

    // Static files - serve from /watchtracker/static/*
    app.use(
        `${config.APP_PATH}/static/*`,
        serveStatic({ root: "./static", rewriteRequestPath: (path) => path.replace(`${config.APP_PATH}/static`, "") }),
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
        const status = (err as Error & { status?: number }).status || 500;
        const isHTMX = c.req.header("hx-request") === "true";
        const path = c.req.path;

        console.error(`Error [${status}] on ${path}: ${err.message}`);
        if (config.isDevelopment && status === 500) {
            console.error(err.stack);
        }

        const errorData = {
            error: {
                message: err.message,
                stack: config.isDevelopment ? err.stack : undefined,
                path: path,
            },
        };

        if (isHTMX) {
            // Return a partial for HTMX
            return c.html(renderError(errorData), status as ContentfulStatusCode);
        } else {
            // Return a full page for normal requests
            return c.html(renderErrorFull(errorData), status as ContentfulStatusCode);
        }
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
