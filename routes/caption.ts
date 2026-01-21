import { HTTPException } from "hono/http-exception";
import { WatchService } from "../service/index.ts";
import { validateWatchOwnership } from "../middleware/ownership.ts";
import { renderCaption } from "../lib/views.ts";
import { authRouter } from "../routers/authRouter.ts";
export default function serve_under_for(path: string, captionRouter: typeof authRouter) {
    captionRouter.get(`${path}/:id`, validateWatchOwnership, async (c) => {
        const session = c.get("session");
        const username = session.username!;
        const watchId = c.req.param("id");
        // Use WatchService to get the user's watch
        const watch = await WatchService.getUserWatchWithMeasurements(username, watchId);
        if (!watch) {
            throw new HTTPException(403, { message: "Wrong Watch ID" });
        }
        return c.html(renderCaption({ watch: watch as any }));
    });

    captionRouter.get(path, (c) => {
        return c.html(renderCaption({ watch: null }));
    });
}
