import * as express from "express";
import { MeasurementService, WatchService } from "../service/index.ts";

const router = express.Router(); // new Router
router.post("/:id", async (req: express.Request, res: express.Response) => {
    // this is a watchId here!!
    const watchId = req.params.id;
    const userId = req.session.user.id;

    // Verify the watch belongs to the user
    const belongsToUser = await WatchService.watchBelongsToUser(watchId, userId);
    if (!belongsToUser) {
        return res.status(403).send("Wrong Watch ID");
    }

    // Create the measurement using the service
    const measurement = await MeasurementService.createMeasurementForWatch(
        userId,
        watchId,
        {
            value: parseInt(req.body.value),
            isStart: req.body.isStart === "true" || req.body.isStart === true,
            comment: req.body.comment,
            createdAt: req.body.createdAt ? new Date(req.body.createdAt) : undefined,
        },
    );

    if (!measurement) {
        return res.status(403).send("Failed to create measurement");
    }

    const watchFull = await WatchService.getUserWatchWithMeasurements(userId, watchId);
    res.locals.watch = watchFull;
    return res.render("measurements");
});
router.delete("/:id", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;
    const measureId = req.params.id;

    // Get the watch ID for the user's measurement
    const watchId = await MeasurementService.getWatchIdForUserMeasurement(userId, measureId);
    if (!watchId) {
        return res.status(403).send("Wrong Measurement ID");
    }

    // Delete the measurement
    await MeasurementService.deleteUserMeasurement(userId, measureId);
    const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);

    res.locals.watch = watch;
    return res.render("measurements");
});
router.patch("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.session.user.id;
    try {
        const measureId = req.params.id;
        const measure = await MeasurementService.getUserMeasurement(userId, measureId);
        if (!measure) {
            return res.status(403).send("Wrong Measurement ID");
        }

        // Get the watch ID from the measurement
        const measurementWithWatch = measure as typeof measure & {
            watch?: { id: string };
        };
        const watchId = measurementWithWatch?.watch?.id || measure.watchId;

        if (!req.body.isStart) {
            req.body.isStart = false;
        }

        try {
            // Update the measurement
            const updateData: {
                value?: number;
                isStart?: boolean;
                comment?: string;
                createdAt?: Date;
            } = {
                value: req.body.value ? parseInt(req.body.value) : undefined,
                isStart: req.body.isStart === "true" || req.body.isStart === true,
                comment: req.body.comment,
            };

            if (req.body.createdAt) {
                updateData.createdAt = new Date(req.body.createdAt);
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
            return res.status(422).send(error.message);
        }

        const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);
        return res.render("measurements", { watch });
    } catch (err) {
        next(err);
    }
});

export default router;
