import { Hono } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import * as config from "../lib/config.ts";

import { Session } from "../middleware/session.ts";
import TimeZone from "../classes/timeZone.ts";
import "../lib/types.ts";

const router = new Hono();

router.get("/", async (c) => {
    const session: Session = c.get("session");
    const full = c.req.header("hx-request") ? "-body" : "-full";

    try {
        const user = UserService.validateSessionUser(session);
        const userWatches = await WatchService.getUserWatches(user.id);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id);

        const render = c.get("render");
        return render(`index${full}`, { user, watch, userWatches, timeZones: TimeZone.timeZones });
    } catch (e: unknown) {
        const error = e as Error;
        console.log("slash.ts:", error.message);
    }

    const render = c.get("render");
    return render(`login${full}`);
});

export default router;
