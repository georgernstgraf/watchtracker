import { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Memcached } from "@avroit/memcached";
import * as config from "../lib/config.ts";
import { UserService } from "../service/userService.ts";

export type MemcacheData = {
    userId?: string;
    createdAt: number;
};

export type MemcacheDataAuth = {
    userId: string;
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

async function hmacSign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
    const expected = await hmacSign(data, secret);
    if (signature.length !== expected.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return result === 0;
}

function signSessionId(sessionId: string, signature: string): string {
    return `${sessionId}.${signature}`;
}

function parseSignedCookie(cookie: string): { sessionId: string; signature: string } | null {
    const parts = cookie.split(".");
    if (parts.length !== 2) return null;
    return { sessionId: parts[0], signature: parts[1] };
}

export class Session {
    private data: MemcacheData;
    private _username: string | undefined;
    private modified = false;
    private id: string;
    private isNew: boolean;
    private shouldDelete = false;

    constructor(id: string, data: MemcacheData | null, isNew: boolean, username?: string) {
        this.id = id;
        this.isNew = isNew;
        this.data = data ?? { createdAt: Date.now() };
        this._username = username;
        if (isNew) {
            this.modified = true;
        }
    }

    get<K extends keyof MemcacheData>(key: K): MemcacheData[K] | undefined {
        return this.data[key];
    }

    set<K extends keyof MemcacheData>(key: K, value: MemcacheData[K]): void {
        if (this.data[key] !== value) {
            this.data[key] = value;
            this.modified = true;
        }
    }

    get username(): string | undefined {
        return this._username;
    }

    set username(value: string | undefined) {
        this._username = value;
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

    getData(): MemcacheData {
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

async function getSessionFromStore(sessionId: string): Promise<MemcacheData | null> {
    try {
        const key = getKey(sessionId);
        const data = await memcached.get(key);
        if (config.isDevelopment) {
            console.log(`SessionStore get: ${sessionId.substring(0, 8)}... (${data ? data.length : 0} bytes)`);
        }
        if (!data) return null;
        return JSON.parse(data) as MemcacheData;
    } catch (err) {
        console.error("SessionStore get error:", err);
        return null;
    }
}

async function persistSession(sessionId: string, data: MemcacheData): Promise<void> {
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
        let sessionData: MemcacheData | null = null;
        let isNew = false;

        const cookieValue = getCookie(c, config.COOKIE_NAME);
        if (cookieValue && config.COOKIE_SECRET) {
            const parsed = parseSignedCookie(cookieValue);
            if (parsed) {
                const isValid = await hmacVerify(parsed.sessionId, parsed.signature, config.COOKIE_SECRET);
                if (isValid) {
                    sessionId = parsed.sessionId;
                    sessionData = await getSessionFromStore(sessionId);
                    if (!sessionData) {
                        sessionId = null;
                    }
                }
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
                    session.username = user.name;
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
        } else if (session.isModified() && c.res.status < 400) {
            await persistSession(sessionId, session.getData());
            if (session.isNewSession() && config.COOKIE_SECRET) {
                const signature = await hmacSign(sessionId, config.COOKIE_SECRET);
                setCookie(c, config.COOKIE_NAME, signSessionId(sessionId, signature), {
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
