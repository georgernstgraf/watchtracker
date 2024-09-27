'use strict';

// import express from "express";
// import { engine } from "../../dist/index.js"; // "express-handlebars"
//
// import * as path from "path";
// import { fileURLToPath } from "url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));



const express = require('express');
const { session } = require('./lib/session');
const httpErrors = require('http-errors'); // middleware for error handlers
const path = require('path');
const { engine: exphbs } = require('express-handlebars');
const expressStaticGzip = require('express-static-gzip');
const bodyParser = require('body-parser');
const prisma = require('./lib/db');
module.exports = function main(options, cb) {
    // Set default options
    const ready = cb || function () { };
    const opts = Object.assign(
        {
            // Default options
        },
        options
    );
    // Server state
    let server;
    let serverStarted = false;
    let serverClosing = false;
    // Setup error handling
    function unhandledError(err) {
        // Log the errors
        console.error(err);
        /* console.error('NOT RESTARTING!');
        return;
        */ // Only clean up once
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
    process.on('uncaughtException', unhandledError);
    process.on('unhandledRejection', unhandledError);
    // Create the express app
    const app = express();
    // Template engine
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 'loopback');
    }

    app.engine('hbs', exphbs({ extname: '.hbs', partialsDir: path.join(__dirname, 'views') }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    // router with sessions, no auth enforced:
    const sessionRouter = express.Router();
    sessionRouter.use(bodyParser.urlencoded({ extended: true }));
    sessionRouter.use(session);
    require('./lib/sessionRoutes')(sessionRouter, opts); // calls .use() several times on the sessionRouter

    // setting up the authRouter
    const authRouter = express.Router();
    authRouter.use(bodyParser.urlencoded({ extended: true }));
    authRouter.use(session);
    authRouter.use(require('./lib/enforceUser'));
    require('./lib/authRoutes')(authRouter, opts); // calls .use() several times on the authRouter

    // use all this routers in the app:
    app.use(process.env.APP_PATH, sessionRouter);
    app.use(`${process.env.APP_PATH}/auth`, authRouter);

    // serve static files as fallbacks
    app.use(process.env.APP_PATH, expressStaticGzip('static'));
    app.use(process.env.APP_PATH, express.static('static'));
    // Common error handlers
    app.use(function fourOhFourHandler(req, res, next) {
        next(httpErrors(404, `Route not found: ${req.url}`));
    });
    app.use(function fiveHundredHandler(err, req, res, next) {
        if (err.status >= 500) {
            console.error(err);
        }
        console.error(`fiveHundred activated: ${err} (${err.status})`);
        res.locals.error = err;
        res.set('Content-Type', 'text/plain');
        res.status(err.status || 500).send(err.message);
    });
    // Start server
    server = app.listen(opts.port, opts.host, function (err) {
        if (err) {
            return ready(err, app, server);
        }
        // If some other error means we should close
        if (serverClosing) {
            return ready(new Error('Server was closed before it could start'));
        }
        serverStarted = true;
        const addr = server.address();
        console.info(
            `Started at http://${opts.host || addr.host || 'localhost'}:${addr.port
            }${process.env.APP_PATH} ${new Date().toLocaleTimeString()}`
        );
        ready(err, app, server);
    });
    process.on('SIGTERM', async () => {
        console.log("SIGTERM received");
        await prisma.$disconnect();
        console.log("disconnected prisma, exiting normally.");
        process.exit();
    });
};;;;
