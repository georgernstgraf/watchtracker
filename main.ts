"use strict";

import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { prisma } from "./lib/db.ts";
import { renderError, renderErrorFull } from "./lib/views.ts";
import { publicRouter } from "./routers/publicRouter.ts";
import { protectedRouter } from "./routers/protectedRouter.ts";
import { globalSessionMiddleware } from "./middleware/session.ts";
import * as config from "./lib/config.ts";
import process from "node:process";

function getContentType(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const types: Record<string, string> = {
        "css": "text/css",
        "js": "application/javascript",
        "json": "application/json",
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "svg": "image/svg+xml",
        "ico": "image/x-icon",
        "woff": "font/woff",
        "woff2": "font/woff2",
        "ttf": "font/ttf",
        "eot": "application/vnd.ms-fontobject",
        "map": "application/json",
    };
    return types[ext] || "application/octet-stream";
}

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
    // Handle completely separately - no session, return 404 if not found
    app.all(`${config.APP_PATH}/static/*`, async (c) => {
        const filePath = c.req.path.replace(`${config.APP_PATH}/static`, "");
        try {
            const file = await Deno.readFile(`./static${filePath}`);
            const contentType = getContentType(filePath);
            return new Response(file, {
                headers: { "Content-Type": contentType },
            });
        } catch {
            return c.text(`Static file not found: ${c.req.path}`, 404);
        }
    });

    // Global Session Middleware - for all non-static routes
    app.use(`${config.APP_PATH}/*`, globalSessionMiddleware);

    // Mount routers
    app.route(config.APP_PATH, publicRouter);
    app.route(config.APP_PATH, protectedRouter);

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
            return c.html(renderError(errorData), status as ContentfulStatusCode);
        } else {
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
