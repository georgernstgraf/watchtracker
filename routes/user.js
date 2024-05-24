const router = require('express').Router();
const User = require('../classes/user');
router.patch('', async (req, res) => {
    const user = await User.byName(req.session.user);
    user.patch(req.body);
    await user.save();
    res.locals.user = user;
    return res.render('timeZoneSelector');
});
module.exports = router;
