import { render, renderData } from "../lib/hbs.ts";

import { sessionRouter } from "../routers/sessionRouter.ts";

export default function serve_under_for(path: string, logoutRouter: typeof sessionRouter) {
    logoutRouter.post(path, async (c) => {
        const session = c.get("session");
        await session.logout();

        if (c.req.header("hx-request")) {
            return c.html(render("login-body", renderData));
        }
        return c.html(render("login-full", renderData));
    });
}
