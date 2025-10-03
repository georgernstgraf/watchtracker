import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
export default function (router: any, opts: any) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use("/watch", require("../routes/watch"));
    router.use("/measure", require("../routes/measure"));
    router.use("/caption", require("../routes/caption"));
    router.use("/user", require("../routes/user"));
}
