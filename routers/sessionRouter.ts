import express from "express";
import bodyParser from "body-parser";
import session from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

const sessionRouter = express.Router();
sessionRouter.use(bodyParser.urlencoded({ extended: true }));
sessionRouter.use(session);
sessionRouter.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.appPath = Deno.env.get("APP_PATH");
    next();
});
sessionRouter.use("/", slash);
sessionRouter.use("/login", login);
sessionRouter.use("/logout", logout);
export default sessionRouter;
