import { WatchService } from "../service/index.ts";
import { Hono } from "hono";
import "../lib/types.ts";

const router = new Hono();

router.get("/:id", async (c) => {
    const session = c.get("session");
    const userId = session.user?.id;
    const watchId = c.req.param("id");

    if (!userId) {
        return c.text("Unauthorized", 401);
    }

    // Use WatchService to get the user's watch with ownership validation
    const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);
    if (!watch) {
        return c.text("Wrong Watch ID", 403);
    }

    c.set("watch", watch);
    c.set("edit", true);
    const render = c.get("render");
    return render("caption");
});

router.get("/", (_c) => {
    // Das ist unschön, rendert das input feld für einen neue caption
    const c = _c;
    c.set("edit", true);
    const render = c.get("render");
    return render("caption");
});

export default router;
