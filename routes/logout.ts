import { Context } from "hono";
import { renderBodyUnauth, renderPageUnauth } from "../lib/views.ts";
import { getSession } from "../middleware/session.ts";

export default async function logoutHandler(c: Context) {
    const session = getSession(c);
    await session.logout();

    if (c.req.header("hx-request")) {
        return c.html(renderBodyUnauth({}));
    }
    return c.html(renderPageUnauth({}));
}
