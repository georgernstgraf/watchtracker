'use strict';
const express = require('express');
const { session } = require('./lib/session');
const httpErrors = require('http-errors'); // middleware for error handlers
const path = require('path');
const ejs = require('ejs');
const expressStaticGzip = require('express-static-gzip');
const bodyParser = require('body-parser');

module.exports = function main(options, cb) {
    // Set default options
    const ready = cb || function () {};
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
    process.on('uncaughtException', unhandledError);
    process.on('unhandledRejection', unhandledError);
    // Create the express app
    const app = express();
    // Template engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.engine('ejs', ejs.renderFile);

    // setting up the authRouter
    const authRouter = express.Router();
    authRouter.use(bodyParser.urlencoded({ extended: true }));
    authRouter.use(session);
    require('./routes')(authRouter, opts); // calls .use() several times on the authRouter
    app.use(process.env.APP_PATH, authRouter);

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
        res.locals.error = err;
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
            `Started at http://${opts.host || addr.host || 'localhost'}:${
                addr.port
            }${process.env.APP_PATH}`
        );
        ready(err, app, server);
    });
};
