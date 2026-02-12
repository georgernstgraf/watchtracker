import { sessionRouter } from "../routers/sessionRouter.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import { renderIndexFull, renderIndexBody, renderLoginFull, renderLoginBody } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

export default function serve_under_for(path: string, slashRouter: typeof sessionRouter) {
    // Register both "/" and "" to handle trailing slash variations
    const paths = path === "/" ? ["/", ""] : [path];

    for (const p of paths) {
        slashRouter.get(p, async (c) => {
            const session = getSession(c);
            const username = session.get("username");
            const full = c.req.header("hx-request") ? "-body" : "-full";
            if (username) {
                const user = await UserService.getUserByName(username);
                const userWatches = await WatchService.getUserWatchesSorted(username, "recent_desc");
                const watch = await WatchService.getWatchForDisplay(username);

                const data = { user, watch, userWatches, timeZones: TimeZone.timeZones };
                return c.html(full === "-body" ? renderIndexBody(data) : renderIndexFull(data));
            } else {
                const sessionId = session.getCache()._id;
                console.log(`slash.ts: No user found -- rendering login page (${sessionId ? sessionId.substring(0, 8) : 'new'}...)`);
                return c.html(full === "-body" ? renderLoginBody({}) : renderLoginFull({}));
            }
        });
    }
}
