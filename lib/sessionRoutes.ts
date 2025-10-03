export default function (router: any, opts: any) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use("/", require("../routes/slash"));
    router.use("/login", require("../routes/login"));
    router.use("/logout", require("../routes/logout"));
}
