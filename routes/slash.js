const router = require('express').Router();
const { userWatches } = require('../classes/watch');
router.get('/', async (req, res) => {
    const user = req.session.user;
    const full = req.headers['hx-request'] ? '' : '-full';
    if (user) {
        res.locals.user = user;
        res.locals.userWatches = await userWatches(user);
        return res.render(`index${full}`);
    }
    return res.render(`login${full}`);
});
module.exports = router;
