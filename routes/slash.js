const router = require('express').Router();
const cookies = require('../lib/cookies');
router.get('/', (req, res) => {
    const user = cookies.extractUser(req.cookies);
    if (user) {
        res.locals.user = user;
        return res.render('index');
    }
    return res.render('login');
});
// this gets the login form req.body.passwd, req.body.user
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
                    passwd: req.body.passwd,
                }),
                headers: { 'Content-Type': 'application/json' },
            });
            const authJson = await authResp.json();
            // auth (bool) und user (string)
            if (authJson.auth) {
                const jwt = cookies.createJWT({ user: authJson.user });
                res.cookie(cookies.cookieName, jwt, cookies.cookieOpts);
                res.locals.user = authJson.user;
                return res.render('index');
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
