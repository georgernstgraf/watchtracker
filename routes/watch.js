const router = require('express').Router();
const { userWatches, belongsToUser, measurements } = require('../lib/db');
const { Measurement, calculateDrifts } = require('../classes/measurement');
router.get('/:id', async (req, res) => {
    const user = req.auth?.user;
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
    calculateDrifts(measureModels);
    res.locals.measurements = measureModels.map((e) => e.getData());
    return res.render('measurements');
});
module.exports = router;
