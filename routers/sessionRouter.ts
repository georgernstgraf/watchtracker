import { Hono } from "hono";

import { Session } from "../middleware/session.ts";

import * as slash from "../routes/slash.ts";
import * as login from "../routes/login.ts";
import * as logout from "../routes/logout.ts";

export const sessionRouter = new Hono<{ Variables: { session: Session } }>();
sessionRouter.use(async (c, next) => {
    return await Session.middleware(c, next);
});

slash.serve_under_for("/", sessionRouter);
login.serve_under_for("/login", sessionRouter);

logout.serve_under_for("/logout", sessionRouter);
