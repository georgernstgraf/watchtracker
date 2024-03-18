const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
router.use(express.urlencoded({ extended: true }));
// POST /login (json)
// success: login user and set a cookie, answer with user data
// failure: text
router.post('/', async (req, res) => {
    const userName = req.auth?.user;
    if (userName) {
        // there was a jwt
        return res.status(200).json({ user: userName });
    }
    const user = {
        user: req.body.user,
        passwd: req.body.passwd,
    };
    try {
        if (!user.user || !user.passwd) {
            const err = new Error('missing user and / or passwd');
            err.status = 400; // Bad Request
            throw err;
        }
        const auth = await fetch(process.env.AUTH_API_URL, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!auth.ok) {
            const err = new Error(auth.statusText);
            err.status = auth.status; // mostly 401
            throw err;
        }
        const resp = await auth.json();
        const token = jwt.sign({ user: user.user }, process.env.JWT_SECRET, {
            expiresIn: '4w',
        });
        res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' });
        res.status(200).json(resp);
    } catch (err) {
        let status;
        if (err.status) {
            status = err.status;
        } else {
            status = 500;
        }
        res.status(status).json(err.message);
    }
});
module.exports = router;
