const jsonwebtoken = require('jsonwebtoken');
const ms = require('ms');
const cookieName = process.env.COOKIE_NAME;
const cookieOpts = {
    maxAge: ms(process.env.COOKIE_MAX_AGE),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH,
};
const cookieLogoutOpts = {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: process.env.APP_PATH,
};
function createJWT(obj) {
    return jsonwebtoken.sign(obj, process.env.JWT_SECRET, {
        expiresIn: ms(process.env.COOKIE_MAX_AGE) / 1000,
    });
}
function createLogoutJWT(obj) {
    return jsonwebtoken.sign(obj, process.env.JWT_SECRET, {
        expiresIn: 0,
    });
}

function getToken(req) {
    return req.cookies[cookieName];
}

module.exports = {
    getToken,
    createJWT,
    createLogoutJWT,
    cookieName,
    cookieOpts,
    cookieLogoutOpts,
};
