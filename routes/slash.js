const router = require('express').Router();
router.get('/', (req, res) => {
    const user = req.auth?.user;
    if (user) {
        res.locals.user = user;
        return res.render('index');
    }
    return res.render('login');
});
module.exports = router;
