import { Hono } from "hono";
import { type Session } from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export const publicRouter = new Hono<{ Variables: { session: Session } }>();

publicRouter.get("/", slash);
publicRouter.get("/login", login);
publicRouter.post("/login", login);
publicRouter.post("/logout", logout);
