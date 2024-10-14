'use strict';
// the following require loads and executes the default export from the modules' main config in package.json
require('../main')({
    host: process.env.APP_HOST || 'localhost',
    port: process.env.APP_PORT || 8000,
});
