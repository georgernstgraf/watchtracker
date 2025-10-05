import { Hono } from "hono";
import { MeasurementService, WatchService } from "../service/index.ts";
import "../lib/types.ts";

const router = new Hono();

router.post("/:id", async (c) => {
    // this is a watchId here!!
    const session = c.get("session");
    const watchId = c.req.param("id");
    const userId = session.user?.id;

    if (!userId) {
        return c.text("Unauthorized", 401);
    }

    // Verify the watch belongs to the user
    const belongsToUser = await WatchService.watchBelongsToUser(watchId, userId);
    if (!belongsToUser) {
        return c.text("Wrong Watch ID", 403);
    }

    const body = await c.req.parseBody();

    // Create the measurement using the service
    const measurement = await MeasurementService.createMeasurementForWatch(
        userId,
        watchId,
        {
            value: parseInt(body.value as string),
            isStart: body.isStart === "true" || body.isStart === true,
            comment: body.comment as string,
            createdAt: body.createdAt ? new Date(body.createdAt as string) : undefined,
        },
    );

    if (!measurement) {
        return c.text("Failed to create measurement", 403);
    }

    const watchFull = await WatchService.getUserWatchWithMeasurements(userId, watchId);
    c.set("watch", watchFull);
    const render = c.get("render");
    return render("measurements");
});

router.delete("/:id", async (c) => {
    const session = c.get("session");
    const userId = session.user?.id;
    const measureId = c.req.param("id");

    if (!userId) {
        return c.text("Unauthorized", 401);
    }

    // Get the watch ID for the user's measurement
    const watchId = await MeasurementService.getWatchIdForUserMeasurement(userId, measureId);
    if (!watchId) {
        return c.text("Wrong Measurement ID", 403);
    }

    // Delete the measurement
    await MeasurementService.deleteUserMeasurement(userId, measureId);
    const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);

    c.set("watch", watch);
    const render = c.get("render");
    return render("measurements");
});

router.patch("/:id", async (c) => {
    const session = c.get("session");
    const userId = session.user?.id;

    if (!userId) {
        return c.text("Unauthorized", 401);
    }

    try {
        const measureId = c.req.param("id");
        const measure = await MeasurementService.getUserMeasurement(userId, measureId);
        if (!measure) {
            return c.text("Wrong Measurement ID", 403);
        }

        // Get the watch ID from the measurement
        const measurementWithWatch = measure as typeof measure & {
            watch?: { id: string };
        };
        const watchId = measurementWithWatch?.watch?.id || measure.watchId;

        const body = await c.req.parseBody();

        if (!body.isStart) {
            body.isStart = "false";
        }

        try {
            // Update the measurement
            const updateData: {
                value?: number;
                isStart?: boolean;
                comment?: string;
                createdAt?: Date;
            } = {
                value: body.value ? parseInt(body.value as string) : undefined,
                isStart: body.isStart === "true" || body.isStart === true,
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
        } catch (e: unknown) {
            const error = e as Error;
            return c.text(error.message, 422);
        }

        const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);
        const render = c.get("render");
        return render("measurements", { watch });
    } catch (err) {
        const error = err as Error;
        return c.text(error.message, 500);
    }
});

export default router;
