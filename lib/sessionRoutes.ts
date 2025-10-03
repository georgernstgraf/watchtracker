import express from "express";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export default function (router: express.Router) {
    // wird beim requiredn gecalled
    // Setup routes, middleware, and handlers
    router.use("/", slash);
    router.use("/login", login);
    router.use("/logout", logout);
}
