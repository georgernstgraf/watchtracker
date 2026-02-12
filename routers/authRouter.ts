import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import user from "../routes/user.ts";
import { sessionMiddlewareProtected, type SessionDataAuth } from "../middleware/session.ts";
import type { Session as HonoSession } from "@jcs224/hono-sessions";
import { Hono } from "hono";

export const authRouter = new Hono<{ Variables: { session: HonoSession<SessionDataAuth> } }>();
authRouter.use(async (c, next) => {
    return await sessionMiddlewareProtected(c, next);
});

watch("/watch", authRouter);
measure("/measure", authRouter);
user("/user", authRouter);
