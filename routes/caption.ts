import { WatchService } from "../service/index.ts";
import "../lib/types.ts";
import render from "../lib/hbs.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
    router.get(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username;
        const watchId = c.req.param("id");
        // Use WatchService to get the user's watch with ownership validation
        const watch = await WatchService.getUserWatchWithMeasurements(username, watchId);
        if (!watch) {
            return c.text("Wrong Watch ID", 403);
        }
        return c.html(render("caption", { watch }));
    });

    router.get("/", (c) => {
        return c.html(render("caption", {}));
    });
}
