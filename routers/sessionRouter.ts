import { Hono } from "hono";

import { Session } from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export const sessionRouter = new Hono<{ Variables: { session: Session } }>();
sessionRouter.use(async (c, next) => {
    return await Session.middleware(c, next);
});

slash("/", sessionRouter);
login("/login", sessionRouter);
logout("/logout", sessionRouter);
