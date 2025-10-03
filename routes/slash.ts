import { Router } from "express";
import Watch from "../classes/watch.ts";
import TimeZone from "../classes/timeZone.ts";
import validSessionUser from "../lib/validSessionUser.ts";

const router = Router();
router.get("/", async (req, res) => {
    const full = req.headers["hx-request"] ? "-body" : "-full";
    try {
        const user = validSessionUser(req.session);
        const userWatches = await Watch.userWatches(user);
        const watch = await Watch.userWatchWithMeasurements(user);
        return res.render(`index${full}`, { user, watch, userWatches, timeZones: TimeZone.timeZones });
    } catch (e) {
        console.log("slash.js:", e.message);
    }
    return res.render(`login${full}`);
});
export default router;
