import { Hono } from "hono";
import { authGuard, type Session } from "../middleware/session.ts";

import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import user from "../routes/user.ts";

export const protectedRouter = new Hono<{ Variables: { session: Session } }>();

// Apply protected session middleware (requires authentication)
protectedRouter.use(authGuard);

// Protected routes - mounted at root to preserve URL structure
protectedRouter.route("/", watch);
protectedRouter.route("/", measure);
protectedRouter.route("/", user);
