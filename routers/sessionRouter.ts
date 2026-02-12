import { Hono } from "hono";
import type { Session as HonoSession } from "@jcs224/hono-sessions";

import { sessionMiddlewarePublic, type SessionData } from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export const sessionRouter = new Hono<{ Variables: { session: HonoSession<SessionData> } }>();

// Only apply session middleware to non-auth routes
// Auth routes have their own middleware in authRouter
sessionRouter.use(async (c, next) => {
    // Skip if this is an auth route (will be handled by authRouter)
    if (c.req.path.includes("/auth")) {
        return await next();
    }
    return await sessionMiddlewarePublic(c, next);
});

slash("/", sessionRouter);
login("/login", sessionRouter);
logout("/logout", sessionRouter);
