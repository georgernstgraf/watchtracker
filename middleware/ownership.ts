import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { WatchService, MeasurementService } from "../service/index.ts";
import { getSession } from "./session.ts";

export const validateWatchOwnership = async (c: Context, next: Next) => {
    const session = getSession(c);
    const username = session?.get("username");
    const watchId = c.req.param("id") || c.req.query("id");

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
    const username = session?.get("username");
    const measureId = c.req.param("id");

    if (!username) {
        throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (!measureId) {
        await next();
        return;
    }

    const measure = await MeasurementService.getUserMeasurement(username, measureId);
    if (!measure) {
        throw new HTTPException(403, { message: "Access denied: You do not own this measurement" });
    }

    // Attach the measure to context to avoid re-fetching in the route if needed
    // c.set("measurement", measure);

    await next();
};
