import { Context } from "hono";
import { UserService } from "../service/index.ts";
import { TimeZone } from "../lib/timezone.ts";
import { renderLoginContent, renderBodyAuth, renderUnauthFull } from "../lib/views.ts";
import authenticate from "../lib/auth.ts";
import { getSession } from "../middleware/session.ts";
import { toUserDataForViews } from "../lib/viewtypes.ts";

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
        return c.html(renderBodyAuth({
            user: toUserDataForViews(user),
            timeZones: TimeZone.timeZones,
        }));
    }

    return c.html(full === "-content" ? renderLoginContent({}) : renderUnauthFull({}));
}

async function handlePostLogin(c: Context) {
    const session = getSession(c);
    const body = await c.req.parseBody();
    const errors = [];

    if (!body.username || (body.username as string).trim() === "") {
        errors.push("Username is required");
    }
    if (!body.password || (body.password as string).trim() === "") {
        errors.push("Password is required");
    }

    if (errors.length !== 0) {
        return c.html(renderLoginContent({ errors }));
    }

    const username = body.username as string;
    const password = body.password as string;

    try {
        await authenticate(username, password);
    } catch (err: unknown) {
        errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        return c.html(renderLoginContent({ errors }));
    }

    const user = await UserService.ensureUserExists(username);
    session.login(user.id);

    return c.html(renderBodyAuth({
        user: toUserDataForViews(user),
        timeZones: TimeZone.timeZones,
    }));
}
