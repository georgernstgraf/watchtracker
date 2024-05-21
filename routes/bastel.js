const tz = require('../classes/timeZone');

const router = require('express').Router();
router.get('', async (req, res) => {
    return res.render('bastel');
});
router.post('', async (req, res, next) => {
    try {
        if (req.body.search == 'undefined') {
            return res.status(400).send('e.g. bastel?s=vienna');
        }
        const zones = tz.search(req.body.search);
        return res.render('bastel-result', { zones });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
