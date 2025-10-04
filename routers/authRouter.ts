import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import express from "express";
import bodyParser from "body-parser";
import enforceUser from "../middleware/enforceUser.ts";
import session from "../middleware/session.ts";

const authRouter = express.Router();
authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use(session);
authRouter.use(enforceUser);
authRouter.use("/watch", watch);
authRouter.use("/measure", measure);
authRouter.use("/caption", caption);
authRouter.use("/user", user);
export default authRouter;
