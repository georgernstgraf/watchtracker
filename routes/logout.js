const router = require('express').Router();
// this gets the login form req.body.passwd, req.body.user
router.post('/', async (req, res) => {
    req.session.destroy();
    if (req.headers['hx-request']) {
        return res.render('login');
    }
    return res.render('login-full');
});
module.exports = router;
