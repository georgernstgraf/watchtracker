import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
import express from "express";
export default function (router: express.Router) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use("/watch", watch);
    router.use("/measure", measure);
    router.use("/caption", caption);
    router.use("/user", user);
}
