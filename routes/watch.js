const router = require('express').Router();
const { userWatches, belongsToUser, measurements } = require('../lib/db');
router.get('/:id', async (req, res) => {
    const user = req.auth?.user;
    if (!user) {
        return res.status(401).send('Not Authenticated');
    }
    res.locals.user = user;
    if (!belongsToUser(req.params.id, user)) {
        return res.status(403).send('This is not your watch');
    }

    const watch = await measurements(req.params.id);
    res.locals.watch = watch;
    res.locals.measurements = watch.measurements;
    return res.render('measurements');
});
module.exports = router;
