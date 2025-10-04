import { EventEmitter } from "node:stream";
import { Memcached } from "@avroit/memcached";
import { Store } from "express-session";

class MemcachedSessionStore extends EventEmitter implements Store {
    memcached: Memcached;
    constructor() {
        super();
        this.memcached = new Memcached({
            host: "127.0.0.1",
            port: 11211,
        });
    }

    // Implement required methods for a session store
    async set(sessionId: string, sessionData: any, callback?: (err?: any) => void) {
        try {
            await this.memcached.set(`session:${sessionId}`, JSON.stringify(sessionData));
            callback?.();
        } catch (err) {
            callback?.(err);
        }
    }

    async destroy(sessionId: string, callback?: (err?: any) => void) {
        try {
            await this.memcached.delete(`session:${sessionId}`);
            callback?.();
        } catch (err) {
            callback?.(err);
        }
    }

    async touch(sessionId: string, sessionData: any, callback?: (err?: any) => void) {
        try {
            await this.memcached.touch(`session:${sessionId}`, 3600); // 1 hour TTL
            callback?.();
        } catch (err) {
            callback?.(err);
        }
    }

    async get(sessionId: string, callback?: (err: any, session?: any) => void) {
        try {
            const data = await this.memcached.get(`session:${sessionId}`);
            const session = data ? JSON.parse(data as string) : null;
            callback?.(null, session);
        } catch (err) {
            callback?.(err);
        }
    }
}
const store = new MemcachedSessionStore();
export default store;
