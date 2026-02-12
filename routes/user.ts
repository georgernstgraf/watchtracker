import { HTTPException } from "hono/http-exception";
import { authRouter } from "../routers/authRouter.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import { renderBodyAuth } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

export default function serve_under_for(path: string, userRouter: typeof authRouter) {
    // patch a user
    userRouter.patch(path, async (c) => {
        const session = getSession(c);
        const username = session.get("username")!;

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
}
