const router = require('express').Router();
const { userWatches } = require('../lib/db');
router.get('/', async (req, res) => {
    const user = req.auth?.user;
    if (user) {
        res.locals.user = user;
        res.locals.userWatches = await userWatches(user);
        return res.render('index');
    }
    return res.render('login');
});
module.exports = router;
