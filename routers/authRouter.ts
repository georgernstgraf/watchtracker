import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import { Session } from "../middleware/session.ts";
import { Hono } from "hono";

export const authRouter = new Hono<{ Variables: { session: Session } }>();

caption("/caption", authRouter);
watch("/watch", authRouter);
measure("/measure", authRouter);
user("/user", authRouter);
