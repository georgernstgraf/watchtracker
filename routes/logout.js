const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'logged out' });
});
module.exports = router;
