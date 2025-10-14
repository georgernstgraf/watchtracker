import { Context, Hono } from "hono";
import { UserService, WatchService } from "../service/index.ts";
import "../lib/types.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";
import render from "../lib/hbs.ts";

// This route renders the measurements table incl. headings
export default function serve_under_for(path: string, router: typeof sessionRouter) {
    router.get(`${path}/:id`, async (c) => {
        return await handleGet(c.req.param("id"), c);
    });

    router.get(`${path}/`, async (c) => {
        const id = c.req.query("id");
        if (!id) {
            return c.text("Watch ID required", 400);
        }
        return await handleGet(id, c);
    });

    // This route only renders the caption (patching only name and comment)
    router.patch(`${path}/:id`, async (c) => {
        try {
            const session = c.get("session");
            const username = session.username;
            const body = await c.req.parseBody();
            let watch = await WatchService.getUserWatchWithMeasurements(username, c.req.param("id"));

            if (!watch) {
                return c.text("This is not your watch", 403);
            }

            await WatchService.updateWatch(c.req.param("id"), {
                name: body.name as string,
                comment: body.comment as string,
            });

            const updatedWatch = await WatchService.getUserWatchWithMeasurements(username, c.req.param("id"));
            const userWatches = await WatchService.getUserWatchesByUname(username);
            return c.html(render("allButHeadAndFoot", { watch: updatedWatch, userWatches }));
        } catch (e: unknown) {
            const error = e as Error;
            console.log("Error in watch patch route:", error.message);
            return c.text(error.message, 401);
        }
    });

    router.post("/", async (c) => {
        try {
            const session = c.get("session");
            const username = session.username;
            const body = await c.req.parseBody();
            let watch = await WatchService.createWatch({
                name: body.name as string,
                comment: body.comment as string,
                user: { connect: { name: username } },
            });
            await UserService.setLastWatch(username, watch.id);
            const userWatches = await WatchService.getUserWatchesByUname(username);
            const newWatch = await WatchService.getUserWatchWithMeasurements(username, watch.id);
            return c.html(render("allButHeadAndFoot", { watch: newWatch, userWatches }));
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
            const username = session.username;
            await WatchService.deleteWatch(c.req.param("id"), username);
            const userWatches = await WatchService.getUserWatchesByUname(username);
            return c.html(render("allButHeadAndFoot", { userWatches }));
        } catch (e: unknown) {
            const error = e as Error;
            if (error.message.includes("session")) {
                return c.text(error.message, 401);
            }
            return c.text("Watch not found or access denied", 403);
        }
    });
}
async function handleGet(id: string, c: Context) {
    try {
        const session = c.get("session");
        const username = session.username;
        const watch = await WatchService.getUserWatchWithMeasurements(username, id);
        if (!watch) {
            return c.text("Wrong Watch ID", 403);
        }
        await UserService.setLastWatch(username, watch.id);
        return c.html(render("measurements", { watch }));
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in watch route:", error.message);
        return c.text(error.message, 401);
    }
}
