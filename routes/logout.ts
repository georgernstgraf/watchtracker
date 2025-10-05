import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { logoutCookieOptions } from "../lib/cookieOptions.ts";
import * as config from "../lib/config.ts";
import "../lib/types.ts";

const router = new Hono();

// this gets the login form req.body.passwd, req.body.user
router.post("/", async (c) => {
    const session = c.get("session");
    await session.destroy();

    setCookie(c, config.COOKIE_NAME, "logout", {
        maxAge: 0,
        httpOnly: logoutCookieOptions.httpOnly,
        secure: logoutCookieOptions.secure,
        sameSite: logoutCookieOptions.sameSite === "strict" ? "Strict" : "Lax",
        path: logoutCookieOptions.path,
    });

    const render = c.get("render");
    if (c.req.header("hx-request")) {
        return render("login-body");
    }
    return render("login-full");
});

export default router;
