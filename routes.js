'use strict';
module.exports = function (app, opts) {
    // Setup routes, middleware, and handlers
    app.get('/', (req, res) => {
        const userName = req.auth.user;
        res.locals.name = 'tmp';
        res.render('index');
    });
};
