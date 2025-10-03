const router = require("express").Router();
const { logoutCookie } = require("../lib/session");
// this gets the login form req.body.passwd, req.body.user
router.post("/", async (req, res) => {
    req.session.destroy();
    res.cookie(process.env.COOKIE_NAME, "logout", logoutCookie);
    if (req.headers["hx-request"]) {
        return res.render("body-login");
    }
    return res.render("login-full");
});
export default router;
