import * as express from "express";
import { logoutCookieOptions } from "../lib/cookies.ts";
import * as config from "../lib/config.ts";

const router = express.Router();
// this gets the login form req.body.passwd, req.body.user
router.post("/", (req: express.Request, res: express.Response) => {
    req.session.destroy();
    res.cookie(config.COOKIE_NAME, "logout", logoutCookieOptions);
    if (req.headers["hx-request"]) {
        return res.render("login-body");
    }
    return res.render("login-full");
});
export default router;
