/**
 * A session store implementation using Memcached as the backing storage.
 *
 * @remarks
 * This is implemented as a singleton - only one instance is exported.
 * I should avoid tight coupling and store only strings!!!
 */
import { Memcached } from "@avroit/memcached";
import ms from "ms";

import { SessionData } from "../middleware/session.ts";
import * as config from "./config.ts";

class MemcachedSessionStore {
    memcached: Memcached;
    prefix = config.MEMCACHE_PREFIX;
    ttl: number; // TTL in seconds

    constructor() { // actually a singleton
        this.memcached = new Memcached({
            host: config.MEMCACHE_HOST,
            port: config.MEMCACHE_PORT,
        });
        // Convert cookie maxAge from milliseconds to seconds for memcached
        this.ttl = Math.floor(ms(config.COOKIE_MAX_AGE) / 1000);
        console.log(`MemcachedSessionStore initialized: ${config.MEMCACHE_HOST}:${config.MEMCACHE_PORT}, TTL: ${this.ttl}s`);
    }

    private getMemcacheKeyFromSessionId(sessionId: string): string {
        return `${this.prefix}-${sessionId}`;
    }

    async getSessionDataById(sessionId: string): Promise<SessionData | undefined> {
        try {
            const key = this.getMemcacheKeyFromSessionId(sessionId);
            const retrieved_string = await this.memcached.get(key);

            if (config.isDevelopment) {
                console.log(`Getting session: ${key} (${retrieved_string ? retrieved_string.length : 0} bytes)`);
            }

            if (!retrieved_string) {
                if (config.isDevelopment) {
                    console.log(`No session data found for: ${key}`);
                }
                return undefined;
            }

            // Parse JSON with error handling
            try {
                const sessionData = JSON.parse(retrieved_string as string);
                if (config.isDevelopment) {
                    console.log(`Session retrieved successfully: ${key}, session:`, sessionData);
                }
                return sessionData;
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

    async createSession(sessionId: string, initialData: string): Promise<void> {
        await this.persistSessionData(sessionId, initialData);
    }

    async deleteSession(sessionId: string): Promise<void> {
        try {
            const key = this.getMemcacheKeyFromSessionId(sessionId);

            if (config.isDevelopment) {
                console.log(`Destroying session: ${key}`);
            }

            await this.memcached.delete(key);

            if (config.isDevelopment) {
                console.log(`Session destroyed successfully: ${key}`);
            }
        } catch (err: unknown) {
            console.error(`Error destroying session:`, err);
        }
    }

    async persistSessionData(sessionId: string, sessionData: string): Promise<void> {
        try {
            const key = this.getMemcacheKeyFromSessionId(sessionId);
            if (config.isDevelopment) {
                console.log(`Setting session: ${key} (${sessionData.length} bytes)`);
            }

            // Set with TTL (expiration time in seconds)
            const success = await this.memcached.set(key, sessionData, this.ttl);

            if (success) {
                if (config.isDevelopment) {
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
