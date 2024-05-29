const router = require('express').Router();
const User = require('../classes/user');
router.patch('', async (req, res) => {
    const userObj = new User(req.session.user);
    userObj.patch(req.body);
    await userObj.save();
    return res.render('timeZoneSelector', { userObj });
});
module.exports = router;
