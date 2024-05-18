const ms = require('ms');
const expressSession = require('express-session');
const MemcachedStore = require('connect-memcached')(expressSession);
ms(process.env.COOKIE_MAX_AGE) / 1000;
const session = expressSession({
    name: process.env.COOKIE_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        maxAge: ms(process.env.COOKIE_MAX_AGE),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: process.env.APP_PATH
    },
    store: new MemcachedStore({
        hosts: ['127.0.0.1:11211']
    })
});
const logoutCookie = {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH
};

module.exports = { session, logoutCookie };
