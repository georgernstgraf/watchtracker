const express = require('express');
const router = express.Router();
const Uhren = require('../models/uhren');

// Get  all
router.get('/', async (req, res) => {
    try {
        const uhren = await Uhren.find();
        res.json(uhren);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/liste', async (req, res) => {
    try {
        const uhren = await Uhren.distinct('uhr');
        res.json(Array.from(uhren));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/daten/:uhr', async (req, res) => {
try {
    const uhren = await Uhren.find({uhr: req.params.uhr});
    res.json(uhren);
} catch (err) {
    res.status(500).json({ message: err.message });
}
})

// Get One
router.get('/id/:id', getUhr, (req, res) => {
    res.json(res.uhr);
})
// Create One
router.post('/', async (req, res) => {
    const uhren = new Uhren({
        user: req.body.user,
        uhr: req.body.uhr,
        dateMeasured: req.body.dateMeasured,
        offsetSecs: req.body.offsetSecs
    })
    try {
        const newUhren = await uhren.save();
        res.status(201).json(newUhren);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
// Update One
router.patch('/id/:id', getUhr, async (req, res) => {
    if (req.body.uhr != null) {
        res.uhr.uhr = req.body.uhr;
    }
    if (req.body.user != null) {
        res.uhr.user = req.body.user;
    }
    if (req.body.dateMeasured != null) {
        res.uhr.dateMeasured = req.body.dateMeasured;
    }
    if (req.body.offsetSecs != null) {
        res.uhr.offsetSecs = req.body.offsetSecs;
    }
    try {
        const updatedUhren = await res.uhr.save();
        res.json(updatedUhren);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
// Delete One
router.delete('/id/:id', getUhr, async (req, res) => {
    try {
        await res.uhr.deleteOne();
        res.json({ message: 'Eintrag entfernt' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

async function getUhr(req, res, next) {
    let uhr;
    try {
        uhr = await Uhren.findById(req.params.id);
        if (uhr == null) {
            return res.status(404).json({ message: 'Uhr mit dieser ID gibt es nicht' });
        }
    } catch (err) {
        if (err.message.startsWith('Cast to ObjectId failed')) {
            return res.status(404).json({ message: 'Uhr mit dieser ID gibt es nicht' });
        }
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
    res.uhr = uhr;
    next();
}
module.exports = router;