'use strict';
module.exports = function (app, opts) {
  // wird beim requiredn gecalled
  // Setup routes, middleware, and handlers
  app.use('/', require('./routes/slash'));
  app.use('/login', require('./routes/login'));
  app.use('/logout', require('./routes/logout'));
  app.use('/watch', require('./routes/watch'));
};
