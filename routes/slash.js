const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
    if (req.auth?.user) {
        return res.render('index');
    }
    return res.render('login');
});
module.exports = router;
