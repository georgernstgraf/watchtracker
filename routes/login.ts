import { sessionRouter } from "../routers/sessionRouter.ts";
import { UserService, WatchService } from "../service/index.ts";
import { TimeZone } from "../lib/timeZone.ts";
import authenticate from "../lib/auth.ts";

export function serve_under_for(path: string, router: typeof sessionRouter) {
    router.post(path, async (c) => {
        const session = c.get("session");
        const body = await c.req.parseBody();
        const errors = [];

        if (!body.user || (body.user as string).trim() === "") {
            errors.push("Username is required");
        }
        if (!body.passwd || (body.passwd as string).trim() === "") {
            errors.push("Password is required");
        }

        if (errors.length !== 0) {
            const render = c.get("render");
            return c.html(render("login-body", { errors }));
        }

        const userName = body.user as string;
        const passwd = body.passwd as string;

        try {
            await authenticate(userName, passwd);
        } catch (err: unknown) {
            errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
            const render = c.get("render");
            return c.html(render("login-body", { errors }));
        }

        // registers the session and sends the cookie
        const user = await UserService.enforceUserExists(userName);
        session.username = user.name; // Store the user data in session

        const userWatches = await WatchService.getUserWatches(user.id);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id);

        const render = c.get("render");
        return c.html(render("body-auth", {
            user,
            userWatches,
            watch,
            timeZones: TimeZone.timeZones,
        }));
    });
}
