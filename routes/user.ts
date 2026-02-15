import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import { renderBodyAuth } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

const userRouter = new Hono();

// PATCH /user - Update user settings
userRouter.patch("/user", async (c) => {
    const session = getSession(c);
    const username = session.username!;

    const body = await c.req.parseBody();

    if ("timeZone" in body && !TimeZone.timeZones.includes(body.timeZone as string)) {
        throw new HTTPException(422, { message: "Unknown / invalid time zone" });
    }

    // Update the user
    const updatedUser = await UserService.updateUser(username, {
        timeZone: body.timeZone as string,
        name: body.name as string,
    });

    const userWatches = await WatchService.getUserWatchesByUname(username);
    let watch = null;
    if (body.selectedWatchId) {
        watch = await WatchService.getWatchForDisplay(username, body.selectedWatchId as string);
    }

    return c.html(renderBodyAuth({
        user: updatedUser,
        timeZones: TimeZone.timeZones,
        userWatches,
        watch,
    }));
});

export default userRouter;
