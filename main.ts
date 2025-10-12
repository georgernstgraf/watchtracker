"use strict";

import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync } from "node:fs";
import prisma from "./lib/db.ts";
import process from "node:process";
import sessionRouter from "./routers/sessionRouter.ts";
import authRouter from "./routers/authRouter.ts";
import * as config from "./lib/config.ts";
import "./lib/types.ts";
import { Session } from "./middleware/session.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface MainOptions {
    host?: string;
    port?: number;
}

// Setup Handlebars
const viewsDir = path.join(__dirname, "views");
const templates: Record<string, HandlebarsTemplateDelegate> = {};
const partials: Record<string, string> = {};

// Load all templates and partials
function loadTemplates() {
    const files = readdirSync(viewsDir);
    files.forEach((file) => {
        if (file.endsWith(".hbs")) {
            const filePath = path.join(viewsDir, file);
            const content = readFileSync(filePath, "utf-8");
            const templateName = file.replace(".hbs", "");
            templates[templateName] = Handlebars.compile(content);
            partials[templateName] = content;
        }
    });

    // Register all partials
    Object.keys(partials).forEach((name) => {
        Handlebars.registerPartial(name, partials[name]);
    });
}

// Register Handlebars helpers
Handlebars.registerHelper("let", function (this: unknown, options: Handlebars.HelperOptions) {
    const context = Object.assign({}, this, options.hash);
    return options.fn(context);
});

Handlebars.registerHelper("or", function (...args: unknown[]) {
    return args.slice(0, -1).some(Boolean);
});

Handlebars.registerHelper("not", function (value: unknown) {
    return !value;
});

Handlebars.registerHelper("eq", function (a: unknown, b: unknown) {
    return a === b;
});

Handlebars.registerHelper("formatDate", function (dateString: string) {
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
});

Handlebars.registerHelper("plusOne", function (val: number) {
    if (val == 0) return 1;
    return val;
});

loadTemplates();

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
        if (config.NODE_ENV === "development") {
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
        process.exit();
    });
}

main();
