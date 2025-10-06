import { Hono } from "hono";

import { Session } from "../middleware/session.ts";
import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

const sessionRouter = new Hono();
sessionRouter.use((c, next) => Session.middleware(c, next));

sessionRouter.route("/", slash);
sessionRouter.route("/login", login);
sessionRouter.route("/logout", logout);

export default sessionRouter;
