import render from "../lib/hbs.ts";
import { sessionRouter } from "../routers/sessionRouter.ts";

export default function serve_under_for(path: string, router: typeof sessionRouter) {
    router.post(path, async (c) => {
        const session = c.get("session");
        await session.logout();

        if (c.req.header("hx-request")) {
            return c.html(render("login-body", {}));
        }
        return c.html(render("login-full", {}));
    });
}
