/**
 * @remarks
 * I avoid tight coupling and store only strings!!!
 */
import { Memcached } from "@avroit/memcached";

import * as config from "./config.ts";

class MemcachedSessionStore {
    memcached: Memcached;
    prefix = config.MEMCACHE_PREFIX;
    ttl_secs = config.COOKIE_MAX_AGE_S;

    constructor() { // actually a singleton
        this.memcached = new Memcached({
            host: config.MEMCACHE_HOST,
            port: config.MEMCACHE_PORT,
        });
        console.log(`MSStore initialized: ${config.MEMCACHE_HOST}:${config.MEMCACHE_PORT}, TTL: ${this.ttl_secs}s`);
    }

    private getStoreKeyFromSessionId(sessionId: string): string {
        return `${this.prefix}-${sessionId}`;
    }

    async getSessionDataById(sessionId: string): Promise<string | undefined> {
        try {
            const key = this.getStoreKeyFromSessionId(sessionId);
            const retrieved_string = await this.memcached.get(key);

            if (config.isDevelopment) {
                console.log(`MSStoreGetting session: ${key} (${retrieved_string ? retrieved_string.length : 0} bytes)`);
            }
            return retrieved_string ?? undefined;
        } catch (err: unknown) {
            console.error(`MSStore Error getting session:`, err);
            return undefined;
        }
    }

    async createSession(sessionId: string, initialData: string): Promise<void> {
        await this.persistSessionData(sessionId, initialData);
    }

    async deleteSession(sessionId: string): Promise<void> {
        try {
            const key = this.getStoreKeyFromSessionId(sessionId);

            if (config.isDevelopment) {
                console.log(`MSStore Destroying session: ${key}`);
            }

            await this.memcached.delete(key);

            if (config.isDevelopment) {
                console.log(`MSStoreSession destroyed successfully: ${key}`);
            }
        } catch (err: unknown) {
            console.error(`MSStore Error destroying session:`, err);
        }
    }

    async persistSessionData(sessionId: string, sessionData: string): Promise<void> {
        try {
            const key = this.getStoreKeyFromSessionId(sessionId);
            if (config.isDevelopment) {
                console.log(`MSStore Setting session: ${key} (${sessionData.length} bytes)`);
            }

            // Set with TTL (expiration time in seconds)
            const success = await this.memcached.set(key, sessionData, this.ttl_secs);

            if (success) {
                if (config.isDevelopment) {
                    console.log(`MSStore Session set successfully: ${key} (expires in ${this.ttl_secs}s)`);
                }
            } else {
                throw new Error(`MSStore Failed to set session: ${key}`);
            }
        } catch (err: unknown) {
            console.error(`MSStore Error setting session:`, err);
            throw err;
        }
    }
}

export default new MemcachedSessionStore();
