const router = require('express').Router();
const cookies = require('../lib/cookies');
// this gets the login form req.body.passwd, req.body.user
router.post('/', async (req, res) => {
    const jwt = cookies.createLogoutJWT({});
    res.cookie(cookies.cookieName, jwt, cookies.cookieLogoutOpts);
    return res.render('login');
});
module.exports = router;
