const router = require('express').Router();
const { measurements } = require('../lib/db');
const Measurement = require('../classes/measurement');
router.get('/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;

    const watch = await measurements(req.params.id, user);
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
module.exports = router;
