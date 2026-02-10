import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import user from "../routes/user.ts";
import { Session, SessionDataAuth } from "../middleware/session.ts";
import { Hono } from "hono";

export const authRouter = new Hono<{ Variables: { session: Session<SessionDataAuth> } }>();
authRouter.use(async (c, next) => {
    return await Session.middleware(c, next, true);
});

watch("/watch", authRouter);
measure("/measure", authRouter);
user("/user", authRouter);
