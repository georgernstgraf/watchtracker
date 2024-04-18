const ms = require('ms');
const expressSession = require('express-session');
ms(process.env.COOKIE_MAX_AGE) / 1000;

/* expressSession({
    genid,
    name,
    proxy,
    resave: false,
    rolling,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    store,
    unset,
    cookie: {
        domain,
        expires,
        httpOnly: true,
        maxAge: null,
        partitioned,
        path: '/',
        priority,
        sameSite,
        secure: false
    }
});
 */
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
    }
});
const cookieLogoutOpts = {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH
};

module.exports = {
    session
};
