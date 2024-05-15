const router = require('express').Router();
const Watch = require('../classes/watch');
router.get('/', async (req, res) => {
    const user = req.session.user;
    const full = req.headers['hx-request'] ? '' : '-full';
    if (user) {
        res.locals.user = user;
        res.locals.userWatches = await Watch.userWatches(user);
        res.locals.watch = await Watch.userWatchWithMeasurements(user);
        return res.render(`index${full}`);
    }
    return res.render(`login${full}`);
});
module.exports = router;
