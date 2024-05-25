const router = require('express').Router(); // new Router
const Measurement = require('../classes/measurement');
const Watch = require('../classes/watch');
router.post('/:id', async (req, res) => {
    // this is a watchId here!!
    const watchId = req.params.id;
    const user = req.session.user;
    if (!(await Watch.belongsToUser(watchId, user))) {
        return res.status(403).send('Wrong Watch ID');
    }
    const m = new Measurement({
        watchId: watchId,
        isStart: true,
        value: 0
    });
    await m.save();
    const watch = await Watch.userWatchWithMeasurements(user, watchId);
    /* if (!watch) {
        return res.status(403).send('Wrong Watch ID');
    } */
    res.locals.watch = watch;
    return res.render('measurements');
});
router.delete('/:id', async (req, res) => {
    const measureId = req.params.id;
    const user = req.session.user;
    const watchId = await Measurement.watchIdForMeasureOfUser(measureId, user);
    if (!watchId) {
        return res.status(403).send('Wrong Watch ID');
    }
    await Measurement.delete(measureId);
    const watch = await Watch.userWatchWithMeasurements(user, watchId);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    res.locals.watch = watch;
    return res.render('measurements');
});
router.patch('/:id', async (req, res, next) => {
    try {
        const measureId = req.params.id;
        const user = req.session.user;
        const measure = await Measurement.getUserMeasurement(user, measureId);
        if (!measure) {
            return res.status(403).send('Wrong Watch ID');
        }
        const watchId = measure['watchId'];
        if (!req.body.isStart) {
            req.body.isStart = false;
        }
        try {
            measure.patch(req.body);  // this is browser localtime
        } catch (e) {
            return res.status(422).send(e.message);
        }
        await measure.save();
        const watch = await Watch.userWatchWithMeasurements(user, watchId);
        return res.render('measurements', { watch });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
