const express = require('express');
const router = express.Router();
// JWT OK: Show Username and Logout Button
// JWT NOT OK: Show Login Button
router.get('/', async (req, res) => {
    const userName = req.auth?.user;
    let code = 200;
    if (!userName) {
        code = 401;
    }
    return res.status(code).send(profileHtml(userName));
});
function profileHtml(userName) {
    if (userName) {
        return `<span>${userName}</span>\n
        <button hx-get="logout">logout</button>`;
    } else {
        return '<button hx-get="login">login</button>';
    }
}
module.exports = router;
