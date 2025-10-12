import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import { Hono } from "hono";
import { Session } from "../middleware/session.ts";
import enforceUser from "../middleware/enforceUser.ts";

export const authRouter = new Hono();

authRouter.use((c, next) => Session.middleware(c, next));
authRouter.use((c, next) => enforceUser(c, next));
authRouter.route("/watch", watch);
authRouter.route("/measure", measure);
authRouter.route("/caption", caption);
authRouter.route("/user", user);
