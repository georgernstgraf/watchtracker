import { Context } from "hono";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import { renderIndexFull, renderIndexBody, renderLoginFull, renderLoginBody } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

export default async function slashHandler(c: Context) {
    const session = getSession(c);
    const username = session.username;
    const full = c.req.header("hx-request") ? "-body" : "-full";
    if (username) {
        const user = await UserService.getUserByName(username);
        const watch = await WatchService.getWatchForDisplay(username);

        const data = { user, watch, userWatches: [], timeZones: TimeZone.timeZones };
        return c.html(full === "-body" ? renderIndexBody(data) : renderIndexFull(data));
    } else {
        const sessionId = session.getId();
        console.log(`slash.ts: No user found -- rendering login page (${sessionId ? sessionId.substring(0, 8) : 'new'}...)`);
        return c.html(full === "-body" ? renderLoginBody({}) : renderLoginFull({}));
    }
}
