import { Memcached } from "@avroit/memcached";
import ms from "ms";
import * as config from "./config.ts";
import type { SessionStore } from "@hono/sessions";

export interface SessionData {
    user?: {
        id: string;
        name: string;
        timeZone?: string;
        lastWatchId?: string;
    };
    [key: string]: unknown;
}

class MemcachedSessionStore implements SessionStore<SessionData> {
    memcached: Memcached;
    prefix = config.MEMCACHE_PREFIX;
    ttl: number; // TTL in seconds

    constructor() {
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

    // Implement SessionStore interface for @hono/sessions
    async getSessionById(sessionId: string): Promise<SessionData | undefined> {
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
                return undefined;
            }

            // Parse JSON with error handling
            try {
                const session = JSON.parse(retrieved_string as string);
                if (config.NODE_ENV === "development") {
                    console.log(`Session retrieved successfully: ${key}`);
                }
                return session;
            } catch (parseErr) {
                console.error(`JSON parse error for session ${key}:`, parseErr);
                // If corrupted, destroy the session
                await this.memcached.delete(key);
                return undefined;
            }
        } catch (err: unknown) {
            console.error(`Error getting session:`, err);
            return undefined;
        }
    }

    async createSession(sessionId: string, initialData: SessionData): Promise<void> {
        await this.persistSessionData(sessionId, initialData);
    }

    async deleteSession(sessionId: string): Promise<void> {
        try {
            const key = this.getKeyFromSessionId(sessionId);

            if (config.NODE_ENV === "development") {
                console.log(`Destroying session: ${key}`);
            }

            await this.memcached.delete(key);

            if (config.NODE_ENV === "development") {
                console.log(`Session destroyed successfully: ${key}`);
            }
        } catch (err: unknown) {
            console.error(`Error destroying session:`, err);
        }
    }

    async persistSessionData(sessionId: string, sessionData: SessionData): Promise<void> {
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
            } else {
                throw new Error(`Failed to set session: ${key}`);
            }
        } catch (err: unknown) {
            console.error(`Error setting session:`, err);
            throw err;
        }
    }
}

export default new MemcachedSessionStore();
