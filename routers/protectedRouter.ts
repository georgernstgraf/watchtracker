import { Hono } from "hono";
import { authGuard, type Session } from "../middleware/session.ts";

import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import user from "../routes/user.ts";

export const protectedRouter = new Hono<{ Variables: { session: Session } }>();

// Protected routes - each route wrapped with authGuard
// We use .use() with specific paths to avoid authGuard running for unmatched routes
protectedRouter.use("/watch/*", authGuard);
protectedRouter.use("/watches", authGuard);
protectedRouter.use("/measure/*", authGuard);
protectedRouter.use("/user", authGuard);

// Routes - mounted at root to preserve URL structure
protectedRouter.route("/", watch);
protectedRouter.route("/", measure);
protectedRouter.route("/", user);
