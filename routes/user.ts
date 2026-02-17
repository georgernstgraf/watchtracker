import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { TimeZone } from "../lib/timezone.ts";
import { UserService } from "../service/index.ts";
import { renderTimezoneSelector } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";
import { toUserDataForViews } from "../lib/viewtypes.ts";

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

    return c.html(renderTimezoneSelector({
        user: toUserDataForViews(updatedUser),
        timeZones: TimeZone.timeZones,
    }));
});

export default userRouter;
