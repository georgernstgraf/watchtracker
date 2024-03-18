const express = require('express');
const router = express.Router();
router.post('/', (req, res) => {
    if (req.auth?.user) {
        // FLASH bei wrong username / password
        return res.render('index');
    }
    return res.render('login');
});
module.exports = router;
