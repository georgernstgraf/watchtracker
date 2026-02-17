import { Context } from "hono";
import { TimeZone } from "../lib/timezone.ts";
import { UserService } from "../service/index.ts";
import { renderIndexFull, renderIndexBody, renderUnauthFull, renderLoginContent } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";
import { toUserDataForViews } from "../lib/viewtypes.ts";

export default async function slashHandler(c: Context) {
    const session = getSession(c);
    const username = session.username;
    const responseSuffix = c.req.header("hx-request") ? "-body" : "-full";
    if (username) {
        const user = await UserService.getUserByName(username);

        const data = { user: toUserDataForViews(user), timeZones: TimeZone.timeZones };
        return c.html(responseSuffix === "-body" ? renderIndexBody(data) : renderIndexFull(data));
    } else {
        const sessionId = session.getId();
        console.log(`slash.ts: No user found -- rendering login page (${sessionId ? sessionId.substring(0, 8) : 'new'}...)`);
        return c.html(responseSuffix === "-body" ? renderLoginContent({}) : renderUnauthFull({}));
    }
}
