const express = require('express');
const router = express.Router();
const db = require('../lib/db');
// Get  all
router.get('/', async (req, res) => {
    const userName = req.auth?.user;
    if (!userName) {
        res.set('Content-Type', 'text/plain');
        return res.status(401).send('Unauthorized');
    }
    try {
        const uhren = await db.watch.findMany({
            where: {
                user: {
                    name: userName,
                },
            },
        });
        const namen = uhren.map((uhr) => uhr.name);
        res.send(watchSelectorHtml(namen));
    } catch (err) {
        res.set('Content-Type', 'text/plain');
        res.status(500).send(err.message);
    }
});

function watchSelectorHtml(watchNames) {
    const head = `<select id="watchSelect" size="${watchNames.length}">\n`;
    let middle = '';
    watchNames.forEach((name) => {
        middle += `    <option value="${name}">${name}</option>\n`;
    });
    const foot = '</select>';
    return head + middle + foot;
}
module.exports = router;
