import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import { Session, SessionDataAuth } from "../middleware/session.ts";
import { Hono } from "hono";
import { sessionRouter } from "./sessionRouter.ts";

export const authRouter = new Hono<{ Variables: { session: Session<SessionDataAuth> } }>();
sessionRouter.use(async (c, next) => {
    return await Session.middleware(c, next, true);
});

caption("/caption", authRouter);
watch("/watch", authRouter);
measure("/measure", authRouter);
user("/user", authRouter);
