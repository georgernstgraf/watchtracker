/**
 * Session Middleware using hono-sessions
 * Stores only userId in session, looks up username from DB on each request
 */
import type { Context, MiddlewareHandler } from "hono";
import { sessionMiddleware, type Session as HonoSession } from "@jcs224/hono-sessions";
import store from "../lib/honoMemcachedStore.ts";
import * as config from "../lib/config.ts";
import { UserService } from "../service/userService.ts";

export type SessionData = {
    userId?: string;
    username?: string;  // Set dynamically by middleware from DB
    createdAt: number;
};

export type SessionDataAuth = {
    userId: string;
    username: string;
    createdAt: number;
};

// Extend the Hono session type with our methods
declare module "@jcs224/hono-sessions" {
    interface Session {
        login(userId: string): void;
        logout(): void;
    }
}

// Helper to get session from context
export function getSession(c: Context): HonoSession<SessionData> {
    return c.get("session") as HonoSession<SessionData>;
}

// Create the global session middleware
export function createGlobalSessionMiddleware(): MiddlewareHandler {
    return async (c, next) => {
        const requestUrl = `${c.req.method} ${c.req.path}`;
        console.log(`=========== SESSION MW START: ${requestUrl} ===========`);

        // Apply hono-sessions middleware
        // Cast to unknown first to avoid Context type mismatch between jsr:@hono/hono and npm:hono
        const middleware = sessionMiddleware({
            store,
            encryptionKey: config.COOKIE_SECRET,
            expireAfterSeconds: config.COOKIE_MAX_AGE_S,
            autoExtendExpiration: true,
            sessionCookieName: config.COOKIE_NAME,
            cookieOptions: {
                path: config.APP_PATH || "/",
                httpOnly: true,
                secure: config.isProduction,
                sameSite: "strict",
                maxAge: config.COOKIE_MAX_AGE_S,
            },
        }) as unknown as MiddlewareHandler;

        await middleware(c, async () => {
            const session = getSession(c);
            const now = Date.now();

            // Check if session needs refresh (older than 1 week)
            const createdAt = session.get("createdAt") as number | undefined;
            const userId = session.get("userId") as string | undefined;

            if (createdAt && now - createdAt > config.SESSION_REFRESH_THRESHOLD_MS) {
                console.log(`SESSION: ${requestUrl} session needs refresh (age: ${Math.floor((now - createdAt) / 1000 / 60 / 60)}h)`);
                // Note: hono-sessions doesn't have regenerate(), so we just update the createdAt
                // The session will be naturally rotated on next login
                session.set("createdAt", now);
            }

            // Add helper methods to session
            session.login = (userId: string) => {
                session.set("userId", userId);
                session.set("createdAt", Date.now());
            };

            session.logout = () => {
                session.deleteSession();
            };

            // If we have a userId, look up the user from DB to get current username
            // This ensures username changes are immediately reflected
            if (userId) {
                try {
                    const user = await UserService.getUserById(userId);
                    if (user) {
                        // Store both in session for routes to access
                        session.set("username", user.name);
                    }
                } catch (err) {
                    console.error(`SESSION: Error looking up user ${userId}:`, err);
                }
            }

            console.log(`    >>>>>>> SESSION NOW NEXT: ${requestUrl} <<<<<<<`);
            await next();
            console.log(`    >>>>>>> SESSION AFTER NEXT: ${requestUrl} <<<<<<<`);
        });

        console.log(`=========== SESSION MW END: ${requestUrl} ===========`);
    };
}

// Auth guard middleware
export const authGuard: MiddlewareHandler = async (c, next) => {
    const session = getSession(c);
    const userId = session.get("userId") as string | undefined;
    
    if (!userId) {
        console.log(`SESSION: ${c.req.method} ${c.req.path} unauthorized`);
        return c.text("Unauthorized", 401);
    }
    
    await next();
};

// Export the global middleware
export const globalSessionMiddleware = createGlobalSessionMiddleware();

