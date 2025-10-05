import { Hono } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import TimeZone from "../classes/timeZone.ts";
import authenticate from "../lib/auth.ts";
import "../lib/types.ts";

const router = new Hono();

// this gets the login form req.body.passwd, req.body.user
// renders the index page on success
router.post("/", async (c) => {
    const session = c.get("session");
    const body = await c.req.parseBody();
    const errors: string[] = [];

    if (!body.user || (body.user as string).trim() === "") {
        errors.push("Username is required");
    }
    if (!body.passwd || (body.passwd as string).trim() === "") {
        errors.push("Password is required");
    }

    if (errors.length !== 0) {
        c.set("errors", errors);
        const render = c.get("render");
        return render("login-body");
    }

    const userName = body.user as string;
    const passwd = body.passwd as string;

    try {
        await authenticate(userName, passwd);
    } catch (err: unknown) {
        errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        c.set("errors", errors);
        const render = c.get("render");
        return render("login-body");
    }

    // registers the session and sends the cookie
    const user = await UserService.enforceUserExists(userName);
    session.user = user; // Store the user data in session

    const userWatches = await WatchService.getUserWatches(user.id);
    const watch = await WatchService.getUserWatchWithMeasurements(user.id);

    const render = c.get("render");
    return render("body-auth", {
        user: session.user,
        userWatches,
        watch,
        timeZones: TimeZone.timeZones,
    });
});

export default router;
