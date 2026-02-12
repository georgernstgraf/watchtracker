import { Context } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { renderLoginBody, renderBodyAuth } from "../lib/views.ts";
import authenticate from "../lib/auth.ts";
import { getSession } from "../middleware/session.ts";

export default async function loginHandler(c: Context) {
    const session = getSession(c);
    const body = await c.req.parseBody();
    const errors = [];

    if (!body.user || (body.user as string).trim() === "") {
        errors.push("Username is required");
    }
    if (!body.passwd || (body.passwd as string).trim() === "") {
        errors.push("Password is required");
    }

    if (errors.length !== 0) {
        return c.html(renderLoginBody({ errors }));
    }

    const userName = body.user as string;
    const passwd = body.passwd as string;

    try {
        await authenticate(userName, passwd);
    } catch (err: unknown) {
        errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        return c.html(renderLoginBody({ errors }));
    }

    // registers the session and sends the cookie
    const user = await UserService.ensureUserExists(userName);
    session.login(user.name); // Store the user data in session

    const userWatches = await WatchService.getUserWatchesByUname(user.name);
    const watch = await WatchService.getWatchForDisplay(user.name);

    return c.html(renderBodyAuth({
        user,
        userWatches,
        watch,
        timeZones: TimeZone.timeZones,
    }));
}
