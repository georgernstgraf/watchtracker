const router = require('express').Router();
const Watch = require('../classes/watch');
const User = require('../classes/user');
// This route renders the measurements table incl. headings
router.get('/:id', async (req, res) => {
    const watch = await Watch.userWatchWithMeasurements(req.session.user, req.params.id);
    if (!watch) {
        return res.status(403).send('Wrong Watch ID');
    }
    await User.setLastWatchIdForUserId(watch.id, watch.user.id);
    res.locals.watch = watch;
    return res.render('measurements');
});
// This route only renders the caption (patching only name and comment)
router.patch('/:id', async (req, res) => {
    const user = req.session.user;
    const watch = await Watch.userWatchWithMeasurements(user, req.params.id);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    watch.patch(req.body);
    await watch.save();
    res.locals.watch = watch;
    res.locals.userWatches = await Watch.userWatches(user);
    return res.render('allButHeadAndFoot');
});
router.post('/', async (req, res) => {
    const user = req.session.user;
    res.locals.user = user;
    let watch = new Watch(req.body);
    watch.user = { connect: { name: user } };
    try {
        await watch.save();
    } catch (e) {
        return res.status(422).send(e.message);
    }
    await User.setLastWatchIdForUser(watch.id, user);
    res.locals.userWatches = await Watch.userWatches(user);
    res.locals.watch = await Watch.userWatchWithMeasurements(user, watch.id);
    return res.render('allButHeadAndFoot');
});
router.delete('/:id', async (req, res) => {
    const user = req.session.user;
    res.locals.user = user;
    await Watch.deleteIDForUserName(req.params.id, user);
    res.locals.userWatches = await Watch.userWatches(user);
    return res.render('allButHeadAndFoot');
});
module.exports = router;
