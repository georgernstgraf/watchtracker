import { Context } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { renderLoginContent, renderBodyAuth, renderUnauthFull } from "../lib/views.ts";
import authenticate from "../lib/auth.ts";
import { getSession } from "../middleware/session.ts";

export default function loginHandler(c: Context) {
    if (c.req.method === "GET") {
        return handleGetLogin(c);
    }
    return handlePostLogin(c);
}

async function handleGetLogin(c: Context) {
    const session = getSession(c);
    const username = session.username;
    const full = c.req.header("hx-request") ? "-content" : "-full";

    if (username) {
        const user = await UserService.getUserByName(username);
        const userWatches = await WatchService.getUserWatchesByUname(username);
        const watch = await WatchService.getWatchForDisplay(username);
        return c.html(renderBodyAuth({
            user,
            userWatches,
            watch,
            timeZones: TimeZone.timeZones,
        }));
    }

    return c.html(full === "-content" ? renderLoginContent({}) : renderUnauthFull({}));
}

async function handlePostLogin(c: Context) {
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
        return c.html(renderLoginContent({ errors }));
    }

    const userName = body.user as string;
    const passwd = body.passwd as string;

    try {
        await authenticate(userName, passwd);
    } catch (err: unknown) {
        errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        return c.html(renderLoginContent({ errors }));
    }

    const user = await UserService.ensureUserExists(userName);
    session.login(user.id);

    const userWatches = await WatchService.getUserWatchesByUname(user.name);
    const watch = await WatchService.getWatchForDisplay(user.name);

    return c.html(renderBodyAuth({
        user,
        userWatches,
        watch,
        timeZones: TimeZone.timeZones,
    }));
}
