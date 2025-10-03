const router = require('express').Router();
const Watch = require('../classes/watch');
const User = require('../classes/user');
const TimeZone = require('../classes/timeZone');
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
    if (errors.length !== 0) {
        return res.render('body-login');
    }
    const userName = req.body.user;
    const passwd = req.body.passwd;
    try {
        const authResp = await fetch(process.env.AUTH_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                user: userName,
                passwd: passwd
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        // auth (bool) und user (string)
        if (!(await authResp.json()).auth) {
            throw new Error('invalid credentials');
        }
    } catch (err) {
        errors.push(`login failed: ${err.message}`);
        return res.render('body-login');
    }
    // registers the session and sends the cookie
    const user = await User.enforceExists(userName);
    req.session.user = user.getCurrentData();
    const userWatches = await Watch.userWatches(user);
    const watch = await Watch.userWatchWithMeasurements(user);
    return res.render('body-auth', {
        user: req.session.user,
        userWatches,
        watch,
        timeZones: TimeZone.timeZones
    });
});
module.exports = router;
