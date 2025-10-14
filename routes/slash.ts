import { Session } from "../middleware/session.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import render from "../lib/hbs.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
    router.get(path, async (c) => {
        const session: Session = c.get("session");
        const username = session.username;
        const full = c.req.header("hx-request") ? "-body" : "-full";
        try {
            const user = await UserService.getUserByName(username);
            const userWatches = await WatchService.getUserWatchesByUname(username);
            const watch = await WatchService.getUserWatchWithMeasurements(username);
            return c.html(render(`index${full}`, { user, watch, userWatches, timeZones: TimeZone.timeZones }));
        } catch (e: unknown) {
            const error = e as Error;
            console.log("slash.ts:", error);
        }
        return c.html(render(`login${full}`, {}));
    });
}
