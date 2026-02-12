/**
 * Memcached Store for hono-sessions
 * Implements the Store interface from @jcs224/hono-sessions
 */
import type { Store, SessionData } from "@jcs224/hono-sessions";
import { Memcached } from "@avroit/memcached";
import * as config from "./config.ts";

export class MemcachedStore implements Store {
    private memcached: Memcached;
    private prefix: string;
    private ttl: number;

    constructor() {
        this.memcached = new Memcached({
            host: config.MEMCACHE_HOST,
            port: config.MEMCACHE_PORT,
        });
        this.prefix = config.MEMCACHE_PREFIX;
        this.ttl = config.MEMCACHE_TTL_S;
        console.log(
            `HonoMemcachedStore initialized: ${config.MEMCACHE_HOST}:${config.MEMCACHE_PORT}, TTL: ${this.ttl}s`,
        );
    }

    private getKey(sessionId: string): string {
        return `${this.prefix}-${sessionId}`;
    }

    async getSessionById(sessionId: string): Promise<SessionData | null> {
        try {
            const key = this.getKey(sessionId);
            const data = await this.memcached.get(key);
            if (config.isDevelopment) {
                console.log(`HonoMCDStore getSessionById: ${sessionId.substring(0, 8)}... (${data ? data.length : 0} bytes)`);
            }
            if (!data) return null;
            return JSON.parse(data) as SessionData;
        } catch (err) {
            console.error("HonoMCDStore Error getting session:", err);
            return null;
        }
    }

    async createSession(sessionId: string, initialData: SessionData): Promise<void> {
        await this.persistSessionData(sessionId, initialData);
    }

    async persistSessionData(sessionId: string, sessionData: SessionData): Promise<void> {
        try {
            const key = this.getKey(sessionId);
            const data = JSON.stringify(sessionData);
            if (config.isDevelopment) {
                console.log(`HonoMCDStore persistSessionData: ${sessionId.substring(0, 8)}... (${data.length} bytes)`);
            }
            const success = await this.memcached.set(key, data, this.ttl);
            if (!success) {
                throw new Error(`Failed to set session: ${key}`);
            }
        } catch (err) {
            console.error("HonoMCDStore Error persisting session:", err);
            throw err;
        }
    }

    async deleteSession(sessionId: string): Promise<void> {
        try {
            const key = this.getKey(sessionId);
            if (config.isDevelopment) {
                console.log(`HonoMCDStore deleteSession: ${sessionId.substring(0, 8)}...`);
            }
            await this.memcached.delete(key);
        } catch (err) {
            console.error("HonoMCDStore Error deleting session:", err);
        }
    }
}

export default new MemcachedStore();
