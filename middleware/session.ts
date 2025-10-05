import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";
import mySessionStore, { type SessionData } from "../lib/memcachedSessionStore.ts";
import * as config from "../lib/config.ts";
import { defaultCookieOptions } from "../lib/cookieOptions.ts";

export type { SessionData };

declare module "hono" {
    interface ContextVariableMap {
        session: SessionData & {
            destroy: () => Promise<void>;
            save: () => Promise<void>;
        };
    }
}

const session = createMiddleware(async (c, next) => {
    // Get session ID from cookie
    let sessionId = getCookie(c, config.COOKIE_NAME);

    // Generate new session ID if none exists
    if (!sessionId) {
        sessionId = generateSessionId();
    }

    // Load session data from store
    let sessionData: SessionData = {};

    if (sessionId) {
        try {
            const data = await new Promise<SessionData | null>((resolve, reject) => {
                mySessionStore.get(sessionId!, (err, session) => {
                    if (err) reject(err);
                    else resolve(session);
                });
            });

            if (data) {
                sessionData = data;
            }
        } catch (err) {
            console.error("Error loading session:", err);
        }
    }

    // Create session object with helper methods
    const session = {
        ...sessionData,
        destroy: async () => {
            if (sessionId) {
                await new Promise<void>((resolve, reject) => {
                    mySessionStore.destroy(sessionId!, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        },
        save: async () => {
            if (sessionId) {
                await new Promise<void>((resolve, reject) => {
                    mySessionStore.set(sessionId!, sessionData, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        },
    };

    // Attach session to context
    c.set("session", session);

    // Continue with request
    await next();

    // Save session after request (if modified)
    if (sessionId) {
        try {
            await new Promise<void>((resolve, reject) => {
                mySessionStore.set(sessionId!, sessionData, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Set session cookie
            setCookie(c, config.COOKIE_NAME, sessionId, {
                maxAge: defaultCookieOptions.maxAge / 1000, // Hono expects seconds
                httpOnly: defaultCookieOptions.httpOnly,
                secure: defaultCookieOptions.secure,
                sameSite: defaultCookieOptions.sameSite === "strict" ? "Strict" : "Lax",
                path: defaultCookieOptions.path,
            });
        } catch (err) {
            console.error("Error saving session:", err);
        }
    }
});

function generateSessionId(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export default session;
