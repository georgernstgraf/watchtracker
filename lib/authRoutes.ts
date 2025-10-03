import watch from "../routes/watch.ts";
import measure from "../routes/measure.ts";
import caption from "../routes/caption.ts";
import user from "../routes/user.ts";
export default function (router: any, opts: any) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use("/watch", watch);
    router.use("/measure", measure);
    router.use("/caption", caption);
    router.use("/user", user);
}
