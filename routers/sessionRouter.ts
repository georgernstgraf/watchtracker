import { Hono } from "hono";

import { Session, SessionData } from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export const sessionRouter = new Hono<{ Variables: { session: Session<SessionData> } }>();

// Only apply session middleware to non-auth routes
// Auth routes have their own middleware in authRouter
sessionRouter.use(async (c, next) => {
    // Skip if this is an auth route (will be handled by authRouter)
    if (c.req.path.includes("/auth")) {
        return await next();
    }
    return await Session.middleware(c, next, false);
});

slash("/", sessionRouter);
login("/login", sessionRouter);
logout("/logout", sessionRouter);
