import { sessionRouter } from "../routers/sessionRouter.ts";
import { TimeZone } from "../lib/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";
import "../lib/types.ts";
import { render, renderData } from "../lib/hbs.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
    // patch a user
    router.patch(path, async (c) => {
        const session = c.get("session");
        const username = session.username;

        const body = await c.req.parseBody();

        if ("timeZone" in body && !TimeZone.timeZones.includes(body.timeZone as string)) {
            return c.text("Unknown / invalid time zone", 422);
        }

        // Update the user
        const updatedUser = await UserService.updateUser(username, {
            timeZone: body.timeZone as string,
            name: body.name as string,
        });

        const userWatches = await WatchService.getUserWatchesByUname(username);
        const watch = await WatchService.getUserWatchWithMeasurements(username, body.selectedWatchId as string);

        return c.html(render(
            "body-auth",
            Object.assign(renderData, {
                user: updatedUser,
                timeZones: TimeZone.timeZones,
                userWatches,
                watch,
            }),
        ));
    });
}
