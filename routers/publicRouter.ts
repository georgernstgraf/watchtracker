import { Hono } from "hono";
import type { Session as HonoSession } from "@jcs224/hono-sessions";
import { type SessionData } from "../middleware/session.ts";

import slash from "../routes/slash.ts";
import login from "../routes/login.ts";
import logout from "../routes/logout.ts";

export const publicRouter = new Hono<{ Variables: { session: HonoSession<SessionData> } }>();

// Public routes
publicRouter.get("/", slash);
publicRouter.post("/login", login);
publicRouter.post("/logout", logout);
