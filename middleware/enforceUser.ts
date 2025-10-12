// Middleware for the authRouter that enforces a user
import { UserService } from "../service/index.ts";
import { createMiddleware } from "hono/factory";

export default createMiddleware(async (c, next) => {
    const session = c.get("session");
    try {
        UserService.assertSessionUserIsPresent(session);
    } catch (e: unknown) {
        const error = e as Error;
        console.log("EnforceUser not satisfied (req, session):", c.req.url, session);
        return c.text(error.message, 401);
    }
    await next();
});
