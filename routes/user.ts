import { Hono } from "hono";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import "../lib/types.ts";

const router = new Hono();

router.patch("", async (c) => {
    const session = c.get("session");
    const userId = session.user?.id;

    if (!userId) {
        return c.text("Unauthorized", 401);
    }

    const body = await c.req.parseBody();

    if ("timeZone" in body && !TimeZone.timeZones.includes(body.timeZone as string)) {
        return c.text("Unknown / invalid time zone", 422);
    }

    // Update the user
    const updatedUser = await UserService.updateUser(userId, {
        timeZone: body.timeZone as string,
        name: body.name as string,
    });

    session.user = updatedUser; // Update session with new user data
    const userWatches = await WatchService.getUserWatches(userId);
    const watch = await WatchService.getUserWatchWithMeasurements(userId);

    const render = c.get("render");
    return render("body-auth", {
        user: updatedUser,
        timeZones: TimeZone.timeZones,
        userWatches,
        watch,
    });
});

export default router;
