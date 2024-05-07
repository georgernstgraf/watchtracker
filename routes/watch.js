const router = require('express').Router();
const Measurement = require('../classes/measurement');
const Watch = require('../classes/watch');
router.get('/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    const watch = await Watch.userWatchWithMeasurements(user, req.params.id);
    if (!watch) {
        return res.status(403).send('This is not your watch');
    }
    res.locals.watch = watch;
    const measureModels = watch.measurements.map((e) => new Measurement(e));
    res.locals.overallMeasure = Measurement.calculateDrifts(measureModels);
    res.locals.measurements = measureModels.map((e) =>
        e.getDisplayData(watch.user.tzOffset)
    );
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
