import { Buffer } from "node:buffer";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserService, WatchService, type SortOption } from "../service/index.ts";
import { validateWatchOwnership } from "../middleware/ownership.ts";
import { renderAllButHeadAndFoot, renderWatchDetails, renderUserWatches } from "../lib/views.ts";
import { resizeImage, validateSquareImage } from "../lib/imageUtils.ts";
import { ForbiddenError } from "../lib/errors.ts";
import type { Prisma } from "generated-prisma-client";
import { getSession } from "../middleware/session.ts";

const watchRouter = new Hono();

// GET /watches - Return watch cards for back navigation
watchRouter.get("/watches", async (c) => {
    const session = getSession(c);
    const username = session.username!;
    const sortBy = (c.req.query("sort") as SortOption) || "recent_desc";
    const userWatches = await WatchService.getUserWatchesSorted(username, sortBy);
    return c.html(renderUserWatches({ userWatches, sortBy }));
});

// GET /watch - Legacy route with query param
watchRouter.get("/watch", validateWatchOwnership, async (c) => {
    const id = c.req.query("id") ?? "";
    return await handleGetDetails(id, c);
});

// GET /watch/:id - Return watch details for card click
watchRouter.get("/watch/:id", validateWatchOwnership, async (c) => {
    const id = c.req.param("id");
    return await handleGetDetails(id, c);
});

watchRouter.patch("/watch/:id", validateWatchOwnership, async (c) => {
    const session = getSession(c);
    const username = session.username!;
    const watchId = c.req.param("id");
    const body = await c.req.parseBody();

    const updateData: Prisma.WatchUpdateInput = {
        name: body.name as string,
        comment: body.comment as string,
    };

    // Handle image upload
    if (body.image && body.image instanceof File) {
        const imageBuffer = await body.image.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);

        // Validate square image
        const validation = await validateSquareImage(uint8Array);
        if (!validation.valid) {
            throw new HTTPException(422, { message: validation.error });
        }

        // Resize and store
        updateData.image = Buffer.from(await resizeImage(uint8Array));
    }

    await WatchService.updateWatch(watchId, updateData);

    const updatedWatch = await WatchService.getWatchForDisplay(username, watchId);
    if (!updatedWatch) {
        throw new HTTPException(404, { message: "Watch not found" });
    }
    const userWatches = await WatchService.getUserWatchesByUname(username);
    return c.html(renderWatchDetails({ watch: updatedWatch, userWatches }));
});

watchRouter.post("/watch", async (c) => {
    const session = getSession(c);
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
    return c.html(renderAllButHeadAndFoot({ watch: newWatch, userWatches }));
});

watchRouter.delete("/watch/:id", validateWatchOwnership, async (c) => {
    const session = getSession(c);
    const userId = session.get("userId")!;
    const username = session.username!;
    try {
        await WatchService.deleteWatch(c.req.param("id"), userId);
    } catch (err) {
        if (err instanceof ForbiddenError) {
            throw new HTTPException(403, { message: err.message });
        }
        throw err;
    }
    const userWatches = await WatchService.getUserWatchesByUname(username);
    return c.html(renderAllButHeadAndFoot({ userWatches, watch: null }));
});

async function handleGetDetails(id: string, c: Context) {
    const session = getSession(c);
    const username = session.username;
    if (!username) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }
    const watch = await WatchService.getWatchForDisplay(username, id);
    if (!watch) {
        throw new HTTPException(403, { message: "Wrong Watch ID" });
    }
    await UserService.setLastWatch(username, watch.id);
    const userWatches = await WatchService.getUserWatchesByUname(username);
    return c.html(renderWatchDetails({ watch, userWatches }));
}

export default watchRouter;
