'use strict';
const ms = require('ms');
// defining express constants
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const httpErrors = require('http-errors');
const path = require('path');
const ejs = require('ejs');
const pino = require('pino');
const pinoPretty = require('pino-pretty');
const pinoHttp = require('pino-http');
const stream = pinoPretty({ colorize: true });
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
    const logger = pino(stream);
    // Server state
    let server;
    let serverStarted = false;
    let serverClosing = false;
    // Setup error handling
    function unhandledError(err) {
        // Log the errors
        logger.error(err);
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
    app.engine('html', ejs.renderFile);
    // Common middleware
    // app.use(/* ... */)
    app.use(expressSession(session));
    app.use(flash());
    app.use(pinoHttp({ logger }));
    // Register routes
    const router = express.Router();
    router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(process.env.LOCATION, router);
    require('./routes')(router, opts);
    app.use(process.env.LOCATION, expressStaticGzip('public'));
    app.use(process.env.LOCATION, express.static('public'));
    // Common error handlers
    app.use(function fourOhFourHandler(req, res, next) {
        next(httpErrors(404, `Route not found: ${req.url}`));
    });
    app.use(function fiveHundredHandler(err, req, res, next) {
        if (err.status >= 500) {
            logger.error(err);
        }
        res.locals.error = err;
        res.status(err.status || 500).render('error');
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
        logger.info(
            `Started at http://${opts.host || addr.host || 'localhost'}:${
                addr.port
            }${process.env.LOCATION}`
        );
        ready(err, app, server);
    });
};
