const router = require('express').Router();
const cookies = require('../lib/session');
const { userWatches } = require('../lib/db');
// this gets the login form req.body.passwd, req.body.user
// renders the index page on success
router.post('/', async (req, res) => {
    const errors = (res.locals.errors = []);
    if (!req.body.user || req.body.user.trim() === '') {
        errors.push('Username is required');
    }
    if (!req.body.passwd || req.body.passwd.trim() === '') {
        errors.push('Password is required');
    }
    if (errors.length === 0) {
        try {
            const authResp = await fetch(process.env.AUTH_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    user: req.body.user,
                    passwd: req.body.passwd
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const authJson = await authResp.json();
            // auth (bool) und user (string)
            if (authJson.auth) {
                const jwt = cookies.createJWT({ user: authJson.user });
                res.cookie(cookies.cookieName, jwt, cookies.cookieOpts);
                res.locals.user = authJson.user;
                res.locals.userWatches = await userWatches(res.locals.user);
                return res.redirect(process.env.APP_PATH);
            }
            errors.push('invalid credentials');
        } catch (err) {
            errors.push(`login failed: ${err.message}`);
        }
        return res.render('login');
    }
    // Unterscheidungen:
    return res.render('index');
});
module.exports = router;
