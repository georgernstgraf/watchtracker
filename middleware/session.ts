import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import memcachedStore, { type SessionData } from "../lib/memcachedSessionStore.ts";
import * as config from "../lib/config.ts";
import ms from "ms";

export type { SessionData };

// Session class that wraps session data
class Session {
    private sessionId: string;
    private data: SessionData;
    private isNew: boolean;
    private isDeleted: boolean = false;

    constructor(sessionId: string, data: SessionData, isNew: boolean) {
        this.sessionId = sessionId;
        this.data = data;
        this.isNew = isNew;
    }

    get user() {
        return this.data.user;
    }

    set user(value: SessionData["user"]) {
        this.data.user = value;
    }

    // Get any property from session data
    get(key: string): unknown {
        return this.data[key];
    }

    // Set any property in session data
    set(key: string, value: unknown): void {
        this.data[key] = value;
    }

    // Delete the session
    deleteSession(): void {
        this.isDeleted = true;
    }

    // Internal method to save session
    async save(): Promise<void> {
        if (this.isDeleted) {
            await memcachedStore.deleteSession(this.sessionId);
        } else {
            await memcachedStore.persistSessionData(this.sessionId, this.data);
        }
    }

    getId(): string {
        return this.sessionId;
    }

    shouldDelete(): boolean {
        return this.isDeleted;
    }
}

// Generate random session ID
function generateSessionId(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// Session middleware
const session = createMiddleware(async (c, next) => {
    // Get session ID from cookie
    let sessionId = getCookie(c, config.COOKIE_NAME);
    let sessionData: SessionData = {};
    let isNew = false;

    if (sessionId) {
        // Try to load existing session
        const existingData = await memcachedStore.getSessionById(sessionId);
        if (existingData) {
            sessionData = existingData;
        } else {
            // Session expired or doesn't exist, create new one
            sessionId = generateSessionId();
            isNew = true;
        }
    } else {
        // No session cookie, create new session
        sessionId = generateSessionId();
        isNew = true;
    }

    // Create session object
    const sessionObj = new Session(sessionId, sessionData, isNew);
    c.set("session", sessionObj as unknown as import("../lib/types.ts").SessionInterface);

    // Process request
    await next();

    // Save session after request
    if (sessionObj.shouldDelete()) {
        // Delete session cookie
        deleteCookie(c, config.COOKIE_NAME, {
            path: config.APP_PATH || "/",
        });
        await sessionObj.save();
    } else {
        // Save session data
        await sessionObj.save();

        // Set session cookie
        setCookie(c, config.COOKIE_NAME, sessionObj.getId(), {
            maxAge: Math.floor(ms(config.COOKIE_MAX_AGE) / 1000),
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "Strict",
            path: config.APP_PATH || "/",
        });
    }
});

export default session;
