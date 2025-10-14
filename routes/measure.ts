import { sessionRouter } from "../routers/sessionRouter.ts";
import { MeasurementService, WatchService } from "../service/index.ts";
import "../lib/types.ts";
import { render, renderData } from "../lib/hbs.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
    // register a new measurement
    router.post(`${path}/:id`, async (c) => {
        // this is a watchId here!!
        const session = c.get("session");
        const watchId = c.req.param("id");
        const username = session.username;

        if (!username) {
            return c.text("Unauthorized", 401);
        }

        // Verify the watch belongs to the user
        const belongsToUser = await WatchService.watchBelongsToUser(watchId, username);
        if (!belongsToUser) {
            return c.text("Wrong Watch ID", 403);
        }

        // Create the measurement using the service
        const body = await c.req.parseBody();
        const measurement = await MeasurementService.createMeasurementForWatch(
            username,
            watchId,
            {
                value: parseInt(body.value as string),
                isStart: body.isStart === "true",
                comment: body.comment as string,
                createdAt: body.createdAt ? new Date(body.createdAt as string) : undefined,
            },
        );

        if (!measurement) {
            return c.text("Failed to create measurement", 403);
        }

        const watchFull = await WatchService.getUserWatchWithMeasurements(username, watchId);
        const watch = watchFull;
        return c.html(render("measurements", Object.assign(renderData, { watch })));
    });

    router.delete(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username;
        const measureId = c.req.param("id");
        const watchId = await MeasurementService.getWatchIdForUserMeasurement(username, measureId);

        if (!watchId) {
            return c.text("Wrong Measurement ID", 403);
        }

        // Delete the measurement
        await MeasurementService.deleteUserMeasurement(username, measureId);
        const watch = await WatchService.getUserWatchWithMeasurements(username, watchId);
        return c.html(render("measurements", Object.assign(renderData, { watch })));
    });

    router.patch(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username;

        try {
            const measureId = c.req.param("id");
            const measure = await MeasurementService.getUserMeasurement(username, measureId);
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
            } catch (e: unknown) {
                const error = e as Error;
                return c.text(error.message, 422);
            }

            const watch = await WatchService.getUserWatchWithMeasurements(username, watchId);
            return c.html(render("measurements", Object.assign(renderData, { watch })));
        } catch (err) {
            const error = err as Error;
            return c.text(error.message, 500);
        }
    });
}
