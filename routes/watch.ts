import { Buffer } from "node:buffer";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserService, WatchService, type SortOption } from "../service/index.ts";
import { validateWatchOwnership } from "../middleware/ownership.ts";
import { renderAllButHeadAndFoot, renderWatchDetails, renderWatchGrid } from "../lib/views.ts";
import { resizeImage, validateSquareImage } from "../lib/imageutils.ts";
import { ForbiddenError } from "../lib/errors.ts";
import type { Prisma } from "generated-prisma-client";
import type * as types from "../lib/viewtypes.ts";
import { getSession } from "../middleware/session.ts";

const watchRouter = new Hono();

// GET /home - Return watch cards for back navigation
watchRouter.get("/home", async (c) => {
    const session = getSession(c);
    const username = session.username!;
    const sortBy = (c.req.query("sort") as SortOption) || "recent_desc";
    const userWatches = await WatchService.getUserWatchesSorted(username, sortBy);
    return c.html(renderAllButHeadAndFoot({ userWatches, watch: null }));
});

// GET /watches - Return watch grid for HTMX sort buttons
watchRouter.get("/watches", async (c) => {
    const session = getSession(c);
    const username = session.username!;
    const sortBy = (c.req.query("sort") as SortOption) || "recent_desc";
    const userWatches = await WatchService.getUserWatchesSorted(username, sortBy);
    return c.html(renderWatchGrid({ userWatches }));
});

// GET /watch/new - Return empty watch form for creating a new watch
// MUST be defined BEFORE /watch/:id to avoid being matched as an ID
watchRouter.get("/watch/new", async (c) => {
    const session = getSession(c);
    const username = session.username;
    if (!username) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }
    const userWatches = await WatchService.getUserWatchesByUname(username);
    // Create a minimal watch object for the "new" state
    const emptyWatch = {
        id: "",
        name: "",
        comment: null,
        image: null,
        userId: "",
        measurements: [],
    } as unknown as types.EnrichedWatch;
    return c.html(renderWatchDetails({ watch: emptyWatch, userWatches }));
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

// GET /watch/image/:id - Return watch image as JPEG
watchRouter.get("/watch/image/:id", validateWatchOwnership, async (c) => {
    const watchId = c.req.param("id");
    const watch = await WatchService.findWatchById(watchId);

    if (!watch || !watch.image) {
        return c.text("Image not found", 404);
    }

    return new Response(watch.image, {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "private, max-age=86400",
        },
    });
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

    // Handle image operations
    if (body.clearImage === 'true') {
        // User cleared the image
        updateData.image = null;
    } else if (body.image && body.image instanceof File) {
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

    const createData: Prisma.WatchCreateInput = {
        name: body.name as string,
        comment: body.comment as string,
        user: { connect: { name: username } },
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
        createData.image = Buffer.from(await resizeImage(uint8Array));
    }

    const watch = await WatchService.createWatch(createData);
    await UserService.setLastWatch(username, watch.id);
    const userWatches = await WatchService.getUserWatchesByUname(username);
    const newWatch = await WatchService.getWatchForDisplay(username, watch.id);
    if (!newWatch) {
        throw new HTTPException(500, { message: "Failed to retrieve created watch" });
    }
    return c.html(renderWatchDetails({ watch: newWatch, userWatches }));
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
