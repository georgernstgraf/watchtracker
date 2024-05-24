const router = require('express').Router();
const Watch = require('../classes/watch');
const TimeZone = require('../classes/timeZone');
const User = require('../classes/user');
router.get('/', async (req, res) => {
    const user = req.session.user;
    const full = req.headers['hx-request'] ? '' : '-full';
    if (user) {
        const userWatches = await Watch.userWatches(user);
        const watch = await Watch.userWatchWithMeasurements(user);
        const userToPass = watch ? watch.user : await User.byName(user);
        return res.render(`index${full}`, { user: userToPass, watch, userWatches, timeZones: TimeZone.timeZones });
    }
    return res.render(`login${full}`);
});
module.exports = router;
