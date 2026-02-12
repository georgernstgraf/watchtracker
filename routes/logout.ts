import { Context } from "hono";
import { renderLoginBody, renderLoginFull } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

export default async function logoutHandler(c: Context) {
    const session = getSession(c);
    await session.logout();

    if (c.req.header("hx-request")) {
        return c.html(renderLoginBody({}));
    }
    return c.html(renderLoginFull({}));
}
