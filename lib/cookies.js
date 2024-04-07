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
function createJWT(obj) {
    return jsonwebtoken.sign(obj, process.env.JWT_SECRET, {
        expiresIn: ms(process.env.COOKIE_MAX_AGE) / 1000,
    });
}
function extractUser(cookies) {
    const jwt = cookies[cookieName];
    if (!jwt) {
        return null;
    }
    try {
        return jsonwebtoken.verify(jwt, process.env.JWT_SECRET)['user'];
    } catch (err) {
        return null;
    }
}
module.exports = { createJWT, cookieName, cookieOpts, extractUser };
