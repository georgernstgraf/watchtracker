import { Hono } from "hono";
import type { Session as HonoSession } from "@jcs224/hono-sessions";
import { sessionMiddlewareProtected, type SessionDataAuth } from "../middleware/session.ts";

import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import user from "../routes/user.ts";

export const protectedRouter = new Hono<{ Variables: { session: HonoSession<SessionDataAuth> } }>();

// Apply protected session middleware (requires authentication)
protectedRouter.use(sessionMiddlewareProtected);

// Protected routes - mounted at root to preserve URL structure
protectedRouter.route("/", watch);
protectedRouter.route("/", measure);
protectedRouter.route("/", user);
