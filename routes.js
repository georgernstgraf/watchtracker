'use strict';
module.exports = function (app, opts) {
    // Setup routes, middleware, and handlers
    app.get('/', (req, res) => {
        if (req.auth?.user) {
            return res.render('index');
        }
        return res.render('login');
    });
};
