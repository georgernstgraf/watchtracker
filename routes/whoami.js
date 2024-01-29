const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json({ user: req.auth.user }); // Use the "user" object as needed
});
module.exports = router;
