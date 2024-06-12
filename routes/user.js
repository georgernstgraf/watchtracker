const router = require('express').Router();
const TimeZone = require('../classes/timeZone');
const User = require('../classes/user');
const Watch = require('../classes/watch');
router.patch('', async (req, res) => {
    const userObj = new User(req.session.user);
    if (req.body.hasOwnProperty('timeZone') && !TimeZone.timeZones.includes(req.body.timeZone)) {
        return res.status(422).send("Unknown / invalid time zone");
    }
    userObj.patch(req.body);
    const user = await userObj.save();
    req.session.user = user.getCurrentData();  // not daring / willing to put a proxy object onto the session
    const userWatches = await Watch.userWatches(user);
    const watch = await Watch.userWatchWithMeasurements(user);
    return res.render('body', { user, timeZones: TimeZone.timeZones, userWatches, watch });
});
module.exports = router;
