import { Hono } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import type { HonoContext } from "../lib/types.ts";
import "../lib/types.ts";

const router = new Hono();

// This route renders the measurements table incl. headings
async function handleGet(id: string, c: HonoContext) {
    try {
        const session = c.get("session");
        const user = UserService.validateSessionUser(session);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id, id);
        if (!watch) {
            return c.text("Wrong Watch ID", 403);
        }
        await UserService.setLastWatch(user.id, watch.id);
        c.set("watch", watch);
        const render = c.get("render");
        return render("measurements");
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in watch route:", error.message);
        return c.text(error.message, 401);
    }
}

router.get("/:id", async (c) => {
    return await handleGet(c.req.param("id"), c);
});

router.get("/", async (c) => {
    const id = c.req.query("id");
    if (!id) {
        return c.text("Watch ID required", 400);
    }
    return await handleGet(id, c);
});

// This route only renders the caption (patching only name and comment)
router.patch("/:id", async (c) => {
    try {
        const session = c.get("session");
        const user = UserService.validateSessionUser(session);
        const body = await c.req.parseBody();
        const watch = await WatchService.getUserWatchWithMeasurements(user.id, c.req.param("id"));

        if (!watch) {
            return c.text("This is not your watch", 403);
        }

        // Update the watch
        await WatchService.updateWatch(c.req.param("id"), {
            name: body.name as string,
            comment: body.comment as string,
        });

        const updatedWatch = await WatchService.getUserWatchWithMeasurements(user.id, c.req.param("id"));
        c.set("watch", updatedWatch);
        c.set("userWatches", await WatchService.getUserWatches(user.id));
        const render = c.get("render");
        return render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in watch patch route:", error.message);
        return c.text(error.message, 401);
    }
});

router.post("/", async (c) => {
    try {
        const session = c.get("session");
        const user = UserService.validateSessionUser(session);
        const body = await c.req.parseBody();
        const watch = await WatchService.createWatch({
            name: body.name as string,
            comment: body.comment as string,
            user: { connect: { id: user.id } },
        });

        await UserService.setLastWatch(user.id, watch.id);
        c.set("userWatches", await WatchService.getUserWatches(user.id));
        c.set("watch", await WatchService.getUserWatchWithMeasurements(user.id, watch.id));
        const render = c.get("render");
        return render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message.includes("session")) {
            return c.text(error.message, 401);
        }
        return c.text(error.message, 422);
    }
});

router.delete("/:id", async (c) => {
    try {
        const session = c.get("session");
        const user = UserService.validateSessionUser(session);
        await WatchService.deleteWatch(c.req.param("id"), user.id);
        c.set("userWatches", await WatchService.getUserWatches(user.id));
        const render = c.get("render");
        return render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message.includes("session")) {
            return c.text(error.message, 401);
        }
        return c.text("Watch not found or access denied", 403);
    }
});

export default router;
