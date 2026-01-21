import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserService, WatchService } from "../service/index.ts";
import { validateWatchOwnership } from "../middleware/ownership.ts";
import "../lib/types.ts";
import { authRouter } from "../routers/authRouter.ts";
import { render, renderData } from "../lib/hbs.ts";

// This route renders the measurements table incl. headings
export default function serve_under_for(path: string, watchRouter: typeof authRouter) {
    watchRouter.get(`${path}`, validateWatchOwnership, async (c) => {
        const id = c.req.query("id") ?? c.req.param("id") ?? "";
        return await handleGet(id, c);
    });

    watchRouter.get(`${path}/:id`, validateWatchOwnership, async (c) => {
        const id = c.req.param("id");
        return await handleGet(id, c);
    });

    watchRouter.patch(`${path}/:id`, validateWatchOwnership, async (c) => {
        const session = c.get("session");
        const username = session.username!;
        const body = await c.req.parseBody();

        await WatchService.updateWatch(c.req.param("id"), {
            name: body.name as string,
            comment: body.comment as string,
        });

        const updatedWatch = await WatchService.getWatchForDisplay(username, c.req.param("id"));
        const userWatches = await WatchService.getUserWatchesByUname(username);
        return c.html(render("allButHeadAndFoot", Object.assign({ watch: updatedWatch, userWatches }, renderData)));
    });

    watchRouter.post(path, async (c) => {
        const session = c.get("session");
        const username = session.username!;
        const body = await c.req.parseBody();
        const watch = await WatchService.createWatch({
            name: body.name as string,
            comment: body.comment as string,
            user: { connect: { name: username } },
        });
        await UserService.setLastWatch(username, watch.id);
        const userWatches = await WatchService.getUserWatchesByUname(username);
        const newWatch = await WatchService.getWatchForDisplay(username, watch.id);
        return c.html(render("allButHeadAndFoot", Object.assign({ watch: newWatch, userWatches }, renderData)));
    });

    watchRouter.delete(`${path}/:id`, validateWatchOwnership, async (c) => {
        const session = c.get("session");
        const username = session.username!;
        await WatchService.deleteWatch(c.req.param("id"), username);
        const userWatches = await WatchService.getUserWatchesByUname(username);
        return c.html(render("allButHeadAndFoot", Object.assign({ userWatches }, renderData)));
    });
}

async function handleGet(id: string, c: Context) {
    const session = c.get("session");
    const username = session.username;
    const watch = await WatchService.getWatchForDisplay(username, id);
    if (!watch) {
        throw new HTTPException(403, { message: "Wrong Watch ID" });
    }
    await UserService.setLastWatch(username, watch.id);
    return c.html(render("measurements", Object.assign({ watch }, renderData)));
}
