import { HTTPException } from "hono/http-exception";
import { WatchService } from "../service/index.ts";
import { validateWatchOwnership } from "../middleware/ownership.ts";
import { renderCaption } from "../lib/views.ts";
import { authRouter } from "../routers/authRouter.ts";
import type { EnrichedWatch } from "../lib/viewTypes.ts";
import type { Watch, Measurement } from "generated-prisma-client";

// Type for Watch with measurements from Prisma include
interface WatchWithMeasurements extends Watch {
    measurements: Measurement[];
}
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
        return c.html(renderCaption({ watch: watch as WatchWithMeasurements as EnrichedWatch }));
    });

    captionRouter.get(path, (c) => {
        return c.html(renderCaption({ watch: null }));
    });
}
