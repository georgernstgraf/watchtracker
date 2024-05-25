'use strict';
module.exports = function (router, opts) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use('/watch', require('../routes/watch'));
    router.use('/measure', require('../routes/measure'));
    router.use('/caption', require('../routes/caption'));
    router.use('/user', require('../routes/user'));
};
