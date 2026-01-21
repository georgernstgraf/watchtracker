import { HTTPException } from "hono/http-exception";
import { MeasurementService, WatchService } from "../service/index.ts";
import "../lib/types.ts";
import { render, renderData } from "../lib/hbs.ts";
import { authRouter } from "../routers/authRouter.ts";

export default function serve_under_for(path: string, measureRouter: typeof authRouter) {
    // register a new measurement
    measureRouter.post(`${path}/:id`, async (c) => {
        // this is a watchId here!!
        const session = c.get("session");
        const watchId = c.req.param("id");
        const username = session.username;

        if (!username) {
            throw new HTTPException(401, { message: "Unauthorized" });
        }

        // Verify the watch belongs to the user
        const belongsToUser = await WatchService.watchBelongsToUser(watchId, username);
        if (!belongsToUser) {
            throw new HTTPException(403, { message: "Wrong Watch ID" });
        }

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
        return c.html(render("measurements", Object.assign({ watch }, renderData)));
    });

    measureRouter.delete(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username!;
        const measureId = c.req.param("id");
        const watchId = await MeasurementService.getWatchIdForUserMeasurement(username, measureId);

        if (!watchId) {
            throw new HTTPException(403, { message: "Wrong Measurement ID" });
        }

        // Delete the measurement
        await MeasurementService.deleteUserMeasurement(username, measureId);
        const watch = await WatchService.getWatchForDisplay(username, watchId);
        return c.html(render("measurements", Object.assign({ watch }, renderData)));
    });

    measureRouter.patch(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username!;

        const measureId = c.req.param("id");
        const measure = await MeasurementService.getUserMeasurement(username, measureId);
        if (!measure) {
            throw new HTTPException(403, { message: "Wrong Measurement ID" });
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
        return c.html(render("measurements", Object.assign({ watch }, renderData)));
    });
}
