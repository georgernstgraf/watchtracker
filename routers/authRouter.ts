import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import { Hono } from "hono";
import enforceUser from "../middleware/enforceUser.ts";

const authRouter = new Hono();

authRouter.use("*", enforceUser);
authRouter.route("/watch", watch);
authRouter.route("/measure", measure);
authRouter.route("/caption", caption);
authRouter.route("/user", user);

export default authRouter;
