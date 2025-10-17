import { sessionRouter } from "../routers/sessionRouter.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import { render, renderData } from "../lib/hbs.ts";

export default function serve_under_for(path: string, slashRouter: typeof sessionRouter) {
    slashRouter.get(path, async (c) => {
        const session = c.get("session");
        const username = session.username;
        const full = c.req.header("hx-request") ? "-body" : "-full";
        if (username) {
            const user = await UserService.getUserByName(username);
            const userWatches = await WatchService.getUserWatchesByUname(username);
            const watch = await WatchService.getUserWatchWithMeasurements(username);
            return c.html(render(`index${full}`, Object.assign({ user, watch, userWatches, timeZones: TimeZone.timeZones }, renderData)));
        } else {
            console.log(`slash.ts: No user found -- rendering login page (${session.shortId})`);
            return c.html(render(`login${full}`, renderData));
        }
    });
}
