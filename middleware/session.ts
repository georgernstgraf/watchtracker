/**
 * Session Middleware using hono-sessions
 */
import type { Context, MiddlewareHandler } from "hono";
import { sessionMiddleware, type Session as HonoSession } from "@jcs224/hono-sessions";
import store from "../lib/honoMemcachedStore.ts";
import * as config from "../lib/config.ts";

export type SessionData = {
    username?: string;
    createdAt: number;
};

export type SessionDataAuth = {
    username: string;
    createdAt: number;
};

// Extend the Hono session type with our methods
declare module "@jcs224/hono-sessions" {
    interface Session {
        login(username: string): void;
        logout(): void;
    }
}

// Helper to get session from context
export function getSession(c: Context): HonoSession<SessionData> {
    return c.get("session") as HonoSession<SessionData>;
}

// Create the session middleware with rolling logic
export function createSessionMiddleware(enforceAuth: boolean): MiddlewareHandler {
    return async (c, next) => {
        const requestUrl = `${c.req.method} ${c.req.path}`;
        console.log(`=========== SESSION MW START: ${requestUrl} ===========`);

        // Track if auth check failed
        let authFailed = false;

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
            const username = session.get("username") as string | undefined;

            if (createdAt && now - createdAt > config.SESSION_REFRESH_THRESHOLD_MS) {
                console.log(`SESSION: ${requestUrl} session needs refresh (age: ${Math.floor((now - createdAt) / 1000 / 60 / 60)}h)`);
                // Note: hono-sessions doesn't have regenerate(), so we just update the createdAt
                // The session will be naturally rotated on next login
                session.set("createdAt", now);
            }

            // Add helper methods to session
            session.login = (username: string) => {
                session.set("username", username);
                session.set("createdAt", Date.now());
            };

            session.logout = () => {
                session.deleteSession();
            };

            // Check auth if required
            if (enforceAuth && !username) {
                console.log(`SESSION: ${requestUrl} unauthorized`);
                authFailed = true;
                return;
            }

            console.log(`    >>>>>>> SESSION NOW NEXT: ${requestUrl} <<<<<<<`);
            await next();
            console.log(`    >>>>>>> SESSION AFTER NEXT: ${requestUrl} <<<<<<<`);
        });

        // Handle auth failure after middleware completes
        if (authFailed) {
            return c.text("Unauthorized", 401);
        }

        console.log(`=========== SESSION MW END: ${requestUrl} ===========`);
    };
}

// Convenience middlewares
export const sessionMiddlewarePublic = createSessionMiddleware(false);
export const sessionMiddlewareProtected = createSessionMiddleware(true);
