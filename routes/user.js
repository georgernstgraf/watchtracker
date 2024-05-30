const router = require('express').Router();
const User = require('../classes/user');
router.patch('', async (req, res) => {
    const userObj = new User(req.session.user);
    userObj.patch(req.body);
    const user = await userObj.save();
    req.session.user = user.getCurrentData();  // not daring to put a proxy object onto the session
    return res.render('timeZoneSelector', { user });
});
module.exports = router;
