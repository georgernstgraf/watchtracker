const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
    if (req.auth?.user) {
        return res.render('index');
    }
    return res.render('login');
});
// this gets the login form req.body.passwd, req.body.user
router.post('/', async (req, res) => {
    if (!req.body.user || req.body.user.trim() === '') {
        req.flash('error', 'Username is required');
    }
    if (!req.body.passwd || req.body.passwd.trim() === '') {
        req.flash('error', 'Password is required');
    }
    if (req.flash('error').length > 0) {
        return res.render('login');
    }
    const auth = await fetch('https://grafg1.spengergasse.at/verify/', {
        method: 'POST',
        body: JSON.stringify({ user: req.body.user, passwd: req.body.passwd }),
        headers: { 'Content-Type': 'application/json' },
    });
    const authJson = await auth.json();

    return res.render('login');
});
module.exports = router;
