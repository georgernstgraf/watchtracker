const router = require('express').Router();
const Measurement = require('../classes/measurement');
const Watch = require('../classes/watch');
const User = require('../classes/user');
const {
    UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR
} = require('@prisma/client/scripts/postinstall.js');
// This route renders the measurements table incl. headings
router.get('/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    const watch = await Watch.userWatchWithMeasurements(user, req.params.id);
    if (!watch) {
        return res.status(403).send('Wrong Watch ID');
    }
    await User.setLastWatchIdForUserId(watch.id, watch.user.id);
    res.locals.watch = watch;
    return res.render('measurements');
});
router.patch('/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    const watch = await Watch.userWatch(user, req.params.id);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    watch.patch(req.body);
    await Watch.save(watch);

    res.locals.watch = watch;
    return res.render('watchCaption');
});
module.exports = router;
