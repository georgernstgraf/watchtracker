import express from "express";
const router = express.Router();
import { UserService, WatchService } from "../service/index.ts";
import TimeZone from "../classes/timeZone.ts";
import authenticate from "../lib/auth.ts";
// this gets the login form req.body.passwd, req.body.user
// renders the index page on success
router.post("/", async (req: express.Request, res: express.Response) => {
    const errors: string[] = res.locals.errors = [];
    if (!req.body.user || req.body.user.trim() === "") {
        errors.push("Username is required");
    }
    if (!req.body.passwd || req.body.passwd.trim() === "") {
        errors.push("Password is required");
    }
    if (errors.length !== 0) {
        return res.render("login-body");
    }
    const userName = req.body.user;
    const passwd = req.body.passwd;
    try {
        await authenticate(userName, passwd);
    } catch (err: unknown) {
        errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        return res.render("login-body");
    }
    // registers the session and sends the cookie
    const user = await UserService.enforceUserExists(userName);
    req.session.user = user; // Store the user data in session
    const userWatches = await WatchService.getUserWatches(user.id);
    const watch = await WatchService.getUserWatchWithMeasurements(user.id);
    return res.render("body-auth", {
        user: req.session.user,
        userWatches,
        watch,
        timeZones: TimeZone.timeZones,
    });
});
export default router;
