import { Session } from "../middleware/session.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";

import { TimeZone } from "../lib/timeZone.ts";

import { UserService, WatchService } from "../service/index.ts";

export function serve_under_for(path: string, router: typeof sessionRouter) {
    router.get(path, async (c) => {
        const session: Session = c.get("session");
        const full = c.req.header("hx-request") ? "-body" : "-full";

        try {
            const user = UserService.assertSessionUserIsPresent(session);
            const userWatches = await WatchService.getUserWatches(user.id);
            const watch = await WatchService.getUserWatchWithMeasurements(user.id);

            return c.html(c.get("render")(`index${full}`, { user, watch, userWatches, timeZones: TimeZone.timeZones }));
        } catch (e: unknown) {
            const error = e as Error;
            console.log("slash.ts:", error);
        }

        const render = c.get("render");
        return render(`login${full}`);
    });
}
