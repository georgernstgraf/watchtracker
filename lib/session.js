const ms = require('ms');
const expressSession = require('express-session');
ms(process.env.COOKIE_MAX_AGE) / 1000;
/* expressSession({
    genid,
    name,
    proxy,
    resave,
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
const cookieOpts = {
    maxAge: ms(process.env.COOKIE_MAX_AGE),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH
};
const cookieLogoutOpts = {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH
};

function getToken(req) {
    return req.cookies[process.env.COOKIE_NAME];
}

module.exports = {
    getToken,
    cookieName: process.env.COOKIE_NAME,
    cookieOpts,
    cookieLogoutOpts
};
