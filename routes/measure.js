const router = require('express').Router(); // new Router
const {
    measureBelongsToUser,
    watchBelongsToUser,
    measurements
} = require('../lib/db');
const Measurement = require('../classes/measurement');
router.post('/:id', async (req, res) => {
    // this is a watchId here!!
    const watchId = req.params.id;
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    if (!(await watchBelongsToUser(watchId, user))) {
        return res.status(403).send('Not your watch');
    }
    const m = new Measurement({
        watchId: watchId,
        isStart: true,
        value: 0
    });
    await m.save();
    const watch = await measurements(watchId, user);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    res.locals.watch = watch;
    const measureModels = watch.measurements.map((e) => new Measurement(e));
    Measurement.calculateDrifts(measureModels);
    res.locals.measurements = measureModels.map((e) =>
        e.getDisplayData(watch.user.tzOffset)
    );
    return res.render('measurements');
});
router.delete('/:id', async (req, res) => {
    const measureId = req.params.id;
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    const watchId = await Measurement.watchIdForMeasureOfUser(measureId, user);
    if (!watchId) {
        return res.status(403).send('Not your watch');
    }
    await Measurement.delete(measureId);
    const watch = await measurements(watchId, user);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    res.locals.watch = watch;
    const measureModels = watch.measurements.map((e) => new Measurement(e));
    Measurement.calculateDrifts(measureModels);
    res.locals.measurements = measureModels.map((e) =>
        e.getDisplayData(watch.user.tzOffset)
    );
    return res.render('measurements');
});
router.patch('/:id', async (req, res) => {
    const measureId = req.params.id;
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    const measure = await Measurement.getUserMeasurement(user, measureId);
    measure.;


    const watchId = await Measurement.watchIdForMeasureOfUser(measureId, user);
    if (!watchId) {
        return res.status(403).send('Not your watch');
    }
    await Measurement.setType(measureId, !req.body.isStart);
    return res.send('ok');
});

module.exports = router;
