import { Router } from "express";
import TimeZone from "../classes/timeZone.ts";
import User from "../classes/user.ts";
import Watch from "../classes/watch.ts";

const router = Router();
router.patch("", async (req, res) => {
    const userObj = new User(req.session.user);
    if (req.body.hasOwnProperty("timeZone") && !TimeZone.timeZones.includes(req.body.timeZone)) {
        return res.status(422).send("Unknown / invalid time zone");
    }
    userObj.patch(req.body);
    const user = await userObj.save();
    req.session.user = user.getCurrentData(); // not daring / willing to put a proxy object onto the session
    const userWatches = await Watch.userWatches(user);
    const watch = await Watch.userWatchWithMeasurements(user);
    return res.render("body-auth", { user, timeZones: TimeZone.timeZones, userWatches, watch });
});

export default router;
