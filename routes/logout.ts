import { Hono } from "hono";
import "../lib/types.ts";

const router = new Hono();

// this gets the login form req.body.passwd, req.body.user
router.post("/", async (c) => {
    const session = c.get("session");
    session.deleteSession();

    const render = c.get("render");
    if (c.req.header("hx-request")) {
        return render("login-body");
    }
    return render("login-full");
});

export default router;
