import { sessionRouter } from "../routers/sessionRouter.ts";
import { UserService, WatchService } from "../service/index.ts";
import { TimeZone } from "../lib/timeZone.ts";
import authenticate from "../lib/auth.ts";
import { render, renderData } from "../lib/hbs.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
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
            return c.html(render("login-body", Object.assign({ errors }, renderData)));
        }

        const userName = body.user as string;
        const passwd = body.passwd as string;

        try {
            await authenticate(userName, passwd);
        } catch (err: unknown) {
            errors.push(`login failed: ${err instanceof Error ? err.message : "unknown error"}`);
            return c.html(render("login-body", Object.assign({ errors }, renderData)));
        }

        // registers the session and sends the cookie
        const user = await UserService.ensureUserExists(userName);
        session.login(user.name); // Store the user data in session

        const userWatches = await WatchService.getUserWatchesByUname(user.name);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id);

        return c.html(render(
            "body-auth",
            Object.assign(renderData, {
                user,
                userWatches,
                watch,
                timeZones: TimeZone.timeZones,
            }),
        ));
    });
}
