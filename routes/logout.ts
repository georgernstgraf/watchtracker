import { renderLoginBody, renderLoginFull } from "../lib/views.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";
import { getSession } from "../middleware/session.ts";

export default function serve_under_for(path: string, logoutRouter: typeof sessionRouter) {
    logoutRouter.post(path, async (c) => {
        const session = getSession(c);
        await session.logout();

        if (c.req.header("hx-request")) {
            return c.html(renderLoginBody({}));
        }
        return c.html(renderLoginFull({}));
    });
}
