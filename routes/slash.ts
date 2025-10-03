import { Router } from "express";
import * as express from "express";
import { WatchService } from "../service/index.ts";
import TimeZone from "../classes/timeZone.ts";
import validSessionUser from "../lib/validSessionUser.ts";

const router = Router();
router.get("/", async (req: express.Request, res: express.Response) => {
    const full = req.headers["hx-request"] ? "-body" : "-full";
    try {
        const user = validSessionUser(req.session);
        const userWatches = await WatchService.getUserWatches(user.id);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id);
        return res.render(`index${full}`, { user, watch, userWatches, timeZones: TimeZone.timeZones });
    } catch (e: unknown) {
        const error = e as Error;
        console.log("slash.js:", error.message);
    }
    return res.render(`login${full}`);
});
export default router;
