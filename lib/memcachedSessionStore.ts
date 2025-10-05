import { Memcached } from "@avroit/memcached";
import * as express_session from "express-session";
import ms from "ms";
import * as config from "./config.ts";

class MemcachedSessionStore extends express_session.Store {
    memcached: Memcached;
    prefix = config.MEMCACHE_PREFIX;
    ttl: number; // TTL in seconds

    constructor() {
        super();
        this.memcached = new Memcached({
            host: config.MEMCACHE_HOST,
            port: config.MEMCACHE_PORT,
        });
        // Convert cookie maxAge from milliseconds to seconds for memcached
        this.ttl = Math.floor(ms(config.COOKIE_MAX_AGE) / 1000);

        if (config.NODE_ENV === "development") {
            console.log(`MemcachedSessionStore initialized: ${config.MEMCACHE_HOST}:${config.MEMCACHE_PORT}, TTL: ${this.ttl}s`);
        }
    }

    private getKeyFromSessionId(sessionId: string): string {
        return `${this.prefix}-${sessionId}`;
    }

    // Implement required methods for a session store
    async set(sessionId: string, sessionData: express_session.SessionData, callback?: (err?: Error) => void) {
        try {
            const key = this.getKeyFromSessionId(sessionId);
            const data = JSON.stringify(sessionData);

            if (config.NODE_ENV === "development") {
                console.log(`Setting session: ${key} (${data.length} bytes)`);
            }

            // Set with TTL (expiration time in seconds)
            const success = await this.memcached.set(key, data, this.ttl);

            if (success) {
                if (config.NODE_ENV === "development") {
                    console.log(`Session set successfully: ${key} (expires in ${this.ttl}s)`);
                }
                callback?.();
            } else {
                const error = new Error(`Failed to set session: ${key}`);
                console.error(error.message);
                callback?.(error);
            }
        } catch (err: unknown) {
            console.error(`Error setting session:`, err);
            callback?.(err as Error);
        }
    }

    async touch(sessionId: string, sessionData: express_session.SessionData, callback?: (err?: Error) => void) {
        // Touch extends the session's TTL by re-setting it
        if (config.NODE_ENV === "development") {
            console.log(`Touching session: ${sessionId}`);
        }
        await this.set(sessionId, sessionData, callback);
    }

    async destroy(sessionId: string, callback?: (err?: Error) => void) {
        try {
            const key = this.getKeyFromSessionId(sessionId);

            if (config.NODE_ENV === "development") {
                console.log(`Destroying session: ${key}`);
            }

            await this.memcached.delete(key);

            if (config.NODE_ENV === "development") {
                console.log(`Session destroyed successfully: ${key}`);
            }
            callback?.();
        } catch (err: unknown) {
            console.error(`Error destroying session:`, err);
            callback?.(err as Error);
        }
    }

    async get(sessionId: string, callback: (err: Error | null, session: express_session.SessionData | null) => void) {
        try {
            const key = this.getKeyFromSessionId(sessionId);

            const retrieved_string = await this.memcached.get(key);

            if (config.NODE_ENV === "development") {
                console.log(`Getting session: ${key} (${retrieved_string ? retrieved_string.length : 0} bytes)`);
            }
            if (!retrieved_string) {
                if (config.NODE_ENV === "development") {
                    console.log(`No session data found for: ${key}`);
                }
                callback?.(null, null);
                return;
            }

            // Parse JSON with error handling
            try {
                const session = JSON.parse(retrieved_string as string);
                if (config.NODE_ENV === "development") {
                    console.log(`Session retrieved successfully: ${key}`);
                }
                callback(null, session);
            } catch (parseErr) {
                console.error(`JSON parse error for session ${key}:`, parseErr);
                // If corrupted, destroy the session
                await this.memcached.delete(key);
                callback(null, null);
            }
        } catch (err: unknown) {
            console.error(`Error getting session:`, err);
            callback(err as Error, null);
        }
    }
}
export default new MemcachedSessionStore();
