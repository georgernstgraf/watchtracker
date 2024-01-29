const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const user = {
        user: req.body.user,
        passwd: req.body.passwd,
    };
    try {
        if (!user.user || !user.passwd) {
            throw new Error('missing user or passwd');
        }
        const auth = await fetch('https://grafg1.spengergasse.at/verify', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!auth.ok) {
            const resp = await auth.json();
            resp.status = auth.status;
            throw resp;
        }
        const resp = await auth.json();
        const token = jwt.sign({ user: user.user }, process.env.JWT_SECRET, {
            expiresIn: '4w',
        });
        res.cookie('token', token, { httpOnly: true, sameSite: 'Strict' });
        res.status(200).json(resp);
    } catch (err) {
        res.status(err.status).json(err);
    }
});
module.exports = router;
