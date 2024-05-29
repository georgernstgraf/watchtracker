const router = require('express').Router();
const Watch = require('../classes/watch');
const TimeZone = require('../classes/timeZone');
const User = require('../classes/user');
router.get('/', async (req, res) => {
    const user = req.session.user;
    const full = req.headers['hx-request'] ? '' : '-full';
    if (user) {
        const userWatches = await Watch.userWatches(user.name);
        const watch = await Watch.userWatchWithMeasurements(user.name);
        const userObj = watch ? watch.user : new User(user);
        return res.render(`index${full}`, { userObj, watch, userWatches, timeZones: TimeZone.timeZones });
    }
    return res.render(`login${full}`);
});
module.exports = router;
