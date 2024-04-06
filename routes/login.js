const express = require('express');
const router = express.Router();
router.post('/', async (req, res) => {
    const user = req.body?.user;
    const passwd = req.body?.passwd;
    const o = { user, passwd };
    const data = await fetch('https://grafg1.spengergasse.at/verify/', {
        method: 'POST',
        body: JSON.stringify(o),
        headers: { 'Content-Type': 'application/json' },
    });
    const body = await data.json();
    if (body.auth) {
        // FLASH bei wrong username / password
        return res.render('index');
    }
    req.flash('error', 'body.error');
    return res.render('login');
});
module.exports = router;
