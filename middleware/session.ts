import { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Memcached } from "@avroit/memcached";
import * as config from "../lib/config.ts";
import { UserService } from "../service/userService.ts";

export type SessionData = {
    userId?: string;
    username?: string;
    createdAt: number;
};

export type SessionDataAuth = {
    userId: string;
    username: string;
    createdAt: number;
};

const memcached = new Memcached({
    host: config.MEMCACHE_HOST,
    port: config.MEMCACHE_PORT,
});

const PREFIX = config.MEMCACHE_PREFIX;
const TTL = config.MEMCACHE_TTL_S;

function getKey(sessionId: string): string {
    return `${PREFIX}-${sessionId}`;
}

async function encrypt(text: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData.slice(0, 32),
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encoder.encode(text)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
}

async function decrypt(encryptedText: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData.slice(0, 32),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );
    const combined = new Uint8Array(
        atob(encryptedText).split("").map((c) => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}

export class Session {
    private data: SessionData;
    private modified = false;
    private id: string;
    private isNew: boolean;
    private shouldDelete = false;

    constructor(id: string, data: SessionData | null, isNew: boolean) {
        this.id = id;
        this.isNew = isNew;
        this.data = data ?? { createdAt: Date.now() };
        if (isNew) {
            this.modified = true;
        }
    }

    get<K extends keyof SessionData>(key: K): SessionData[K] | undefined {
        return this.data[key];
    }

    set<K extends keyof SessionData>(key: K, value: SessionData[K]): void {
        if (this.data[key] !== value) {
            this.data[key] = value;
            this.modified = true;
        }
    }

    isModified(): boolean {
        return this.modified;
    }

    isNewSession(): boolean {
        return this.isNew;
    }

    getId(): string {
        return this.id;
    }

    getData(): SessionData {
        return this.data;
    }

    login(userId: string): void {
        this.set("userId", userId);
        this.set("createdAt", Date.now());
    }

    logout(): void {
        this.shouldDelete = true;
    }

    needsDelete(): boolean {
        return this.shouldDelete;
    }
}

async function getSessionFromStore(sessionId: string): Promise<SessionData | null> {
    try {
        const key = getKey(sessionId);
        const data = await memcached.get(key);
        if (config.isDevelopment) {
            console.log(`SessionStore get: ${sessionId.substring(0, 8)}... (${data ? data.length : 0} bytes)`);
        }
        if (!data) return null;
        return JSON.parse(data) as SessionData;
    } catch (err) {
        console.error("SessionStore get error:", err);
        return null;
    }
}

async function persistSession(sessionId: string, data: SessionData): Promise<void> {
    try {
        const key = getKey(sessionId);
        const json = JSON.stringify(data);
        if (config.isDevelopment) {
            console.log(`SessionStore persist: ${sessionId.substring(0, 8)}... (${json.length} bytes)`);
        }
        await memcached.set(key, json, TTL);
    } catch (err) {
        console.error("SessionStore persist error:", err);
    }
}

async function deleteSessionFromStore(sessionId: string): Promise<void> {
    try {
        const key = getKey(sessionId);
        if (config.isDevelopment) {
            console.log(`SessionStore delete: ${sessionId.substring(0, 8)}...`);
        }
        await memcached.delete(key);
    } catch (err) {
        console.error("SessionStore delete error:", err);
    }
}

export function getSession(c: Context): Session {
    return c.get("session") as Session;
}

export function createGlobalSessionMiddleware(): MiddlewareHandler {
    return async (c, next) => {
        const requestUrl = `${c.req.method} ${c.req.path}`;
        if (config.isDevelopment) {
            console.log(`=========== SESSION MW START: ${requestUrl} ===========`);
        }

        let sessionId: string | null = null;
        let sessionData: SessionData | null = null;
        let isNew = false;

        const cookieValue = getCookie(c, config.COOKIE_NAME);
        if (cookieValue && config.COOKIE_SECRET) {
            try {
                sessionId = await decrypt(cookieValue, config.COOKIE_SECRET);
                sessionData = await getSessionFromStore(sessionId);
                if (!sessionData) {
                    sessionId = null;
                }
            } catch {
                sessionId = null;
            }
        }

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            isNew = true;
        }

        const session = new Session(sessionId, sessionData, isNew);
        c.set("session", session);

        const userId = session.get("userId");

        if (userId) {
            try {
                const user = await UserService.getUserById(userId);
                if (user) {
                    const currentUsername = session.get("username");
                    if (currentUsername !== user.name) {
                        session.set("username", user.name);
                    }
                }
            } catch (err) {
                console.error(`SESSION: Error looking up user ${userId}:`, err);
            }
        }

        const createdAt = session.get("createdAt");
        const now = Date.now();
        if (createdAt && now - createdAt > config.SESSION_REFRESH_THRESHOLD_MS) {
            if (config.isDevelopment) {
                console.log(`SESSION: ${requestUrl} refreshing session (age: ${Math.floor((now - createdAt) / 1000 / 60 / 60)}h)`);
            }
            session.set("createdAt", now);
        }

        if (config.isDevelopment) {
            console.log(`    >>>>>>> SESSION NOW NEXT: ${requestUrl} <<<<<<<`);
        }
        await next();
        if (config.isDevelopment) {
            console.log(`    >>>>>>> SESSION AFTER NEXT: ${requestUrl} <<<<<<<`);
        }

        if (session.needsDelete()) {
            await deleteSessionFromStore(sessionId);
            deleteCookie(c, config.COOKIE_NAME, { path: config.APP_PATH || "/" });
        } else if (session.isModified()) {
            await persistSession(sessionId, session.getData());
            if (session.isNewSession() && config.COOKIE_SECRET) {
                const encryptedId = await encrypt(sessionId, config.COOKIE_SECRET);
                setCookie(c, config.COOKIE_NAME, encryptedId, {
                    path: config.APP_PATH || "/",
                    httpOnly: true,
                    secure: config.isProduction,
                    sameSite: "Strict",
                    maxAge: config.COOKIE_MAX_AGE_S,
                });
            }
        }

        if (config.isDevelopment) {
            console.log(`=========== SESSION MW END: ${requestUrl} ===========`);
        }
    };
}

export const authGuard: MiddlewareHandler = async (c, next) => {
    const session = getSession(c);
    const userId = session.get("userId");

    if (!userId) {
        if (config.isDevelopment) {
            console.log(`SESSION: ${c.req.method} ${c.req.path} unauthorized`);
        }
        return c.text("Unauthorized", 401);
    }

    await next();
};

export const globalSessionMiddleware = createGlobalSessionMiddleware();
