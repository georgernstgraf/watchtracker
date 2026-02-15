import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { MeasurementService, WatchService } from "../service/index.ts";
import { validateWatchOwnership, validateMeasurementOwnership } from "../middleware/ownership.ts";
import { renderMeasurements } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

const measureRouter = new Hono();

// POST /measure/:id - Create a new measurement for a watch
measureRouter.post("/measure/:id", validateWatchOwnership, async (c) => {
    // this is a watchId here!!
    const session = getSession(c);
    const watchId = c.req.param("id");
    const username = session.username!;

    // Create the measurement using the service
    const body = await c.req.parseBody();
    const measurement = await MeasurementService.createMeasurementForWatch(
        username,
        watchId,
        {
            value: parseInt(body.value as string) || 0,
            isStart: body.isStart === "true",
            comment: body.comment as string,
            createdAt: body.createdAt ? new Date(body.createdAt as string) : undefined,
        },
    );

    if (!measurement) {
        throw new HTTPException(403, { message: "Failed to create measurement" });
    }

    const watch = await WatchService.getWatchForDisplay(username, watchId);
    if (!watch) {
        throw new HTTPException(403, { message: "Wrong Watch ID" });
    }
    return c.html(renderMeasurements({ watch }));
});

measureRouter.delete("/measure/:id", validateMeasurementOwnership, async (c) => {
    const session = getSession(c);
    const username = session.username!;
    const measureId = c.req.param("id");
    const watchId = await MeasurementService.getWatchIdForUserMeasurement(username, measureId);

    if (!watchId) {
        throw new HTTPException(403, { message: "Wrong Measurement ID" });
    }

    // Delete the measurement
    await MeasurementService.deleteUserMeasurement(username, measureId);
    const watch = await WatchService.getWatchForDisplay(username, watchId);
    if (!watch) {
        throw new HTTPException(403, { message: "Wrong Watch ID" });
    }
    return c.html(renderMeasurements({ watch }));
});

measureRouter.patch("/measure/:id", validateMeasurementOwnership, async (c) => {
    const session = getSession(c);
    const username = session.username!;

    const measureId = c.req.param("id");
    const measure = await MeasurementService.getUserMeasurement(username, measureId);
    // Ownership verified by middleware, so we know it exists and belongs to user
    const watchId = measure!.watchId;

    const body = await c.req.parseBody();

    if (!body.isStart) {
        body.isStart = "false";
    }

    // Update the measurement
    const updateData: {
        value?: number;
        isStart?: boolean;
        comment?: string;
        createdAt?: Date;
    } = {
        value: body.value ? parseInt(body.value as string) : undefined,
        isStart: body.isStart === "true",
        comment: body.comment as string,
    };

    if (body.createdAt) {
        updateData.createdAt = new Date(body.createdAt as string);
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
        }
    });

    await MeasurementService.updateMeasurement(measureId, updateData);

    const watch = await WatchService.getWatchForDisplay(username, watchId);
    if (!watch) {
        throw new HTTPException(403, { message: "Wrong Watch ID" });
    }
    return c.html(renderMeasurements({ watch }));
});

export default measureRouter;
