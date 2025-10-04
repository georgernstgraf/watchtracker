import * as express from "express";
import { logoutCookieOptions } from "../lib/cookies.ts";

const router = express.Router();
// this gets the login form req.body.passwd, req.body.user
router.post("/", (req: express.Request, res: express.Response) => {
    req.session.destroy();
    res.cookie(Deno.env.get("COOKIE_NAME") ?? "", "logout", logoutCookieOptions);
    if (req.headers["hx-request"]) {
        return res.render("login-body");
    }
    return res.render("login-full");
});
export default router;
