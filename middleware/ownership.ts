import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { WatchService, MeasurementService } from "../service/index.ts";
import { getSession } from "./session.ts";

export const validateWatchOwnership = async (c: Context, next: Next) => {
    const session = getSession(c);
    const username = session?.username;
    const watchId = c.req.param("watchId") || c.req.param("id") || c.req.query("id");

    if (!username) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (!watchId) {
        await next();
        return;
    }

    const belongsToUser = await WatchService.watchBelongsToUser(watchId, username);
    if (!belongsToUser) {
        throw new HTTPException(403, { message: "Access denied: You do not own this watch" });
    }

    await next();
};

export const validateMeasurementOwnership = async (c: Context, next: Next) => {
    const session = getSession(c);
    const username = session?.username;
    const measurementId = c.req.param("measurementId") || c.req.param("id");

    if (!username) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (!measurementId) {
        await next();
        return;
    }

    const measurement = await MeasurementService.getUserMeasurement(username, measurementId);
    if (!measurement) {
        throw new HTTPException(403, { message: "Access denied: You do not own this measurement" });
    }

    // Attach the measurement to context to avoid re-fetching in the route if needed
    // c.set("measurement", measurement);

    await next();
};
