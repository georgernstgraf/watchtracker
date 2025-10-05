import { Hono } from "hono";
import * as config from "../lib/config.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

const sessionRouter = new Hono();

// Add appPath to all routes
sessionRouter.use("*", async (c, next) => {
    c.set("appPath", config.APP_PATH);
    await next();
});

sessionRouter.route("/", slash);
sessionRouter.route("/login", login);
sessionRouter.route("/logout", logout);

export default sessionRouter;
