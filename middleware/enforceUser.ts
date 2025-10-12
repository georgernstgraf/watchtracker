// Middleware for the authRouter that enforces a user
import { UserService } from "../service/index.ts";
import { createMiddleware } from "hono/factory";

export default createMiddleware(async (c, next) => {
    const session = c.get("session");

    try {
        // throws if no valid user in session
        const user = UserService.assertSessionUserIsPresent(session);
        // Session is already in context via @hono/sessions
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in enforceUser middleware");
        console.log(error);
        return c.text(error.message, 401);
    }

    await next();
});
