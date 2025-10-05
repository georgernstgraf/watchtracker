import { EventEmitter } from "node:events";
import { Memcached } from "@avroit/memcached";
import { Store } from "express-session";
export default class MemcachedSessionStore extends EventEmitter implements Store {
    memcached: Memcached;
    constructor() {
        super();
        this.memcached = new Memcached({
            host: "127.0.0.1",
            port: 11211,
        });
    }
    //
    // Implement required methods for a session store
    async set(sessionId: string, sessionData: unknown, callback?: (err?: Error) => void) {
        console.log("Setting session:", sessionId);
        console.log("Session data:", sessionData);
        try {
            await this.memcached.set(`session:${sessionId}`, JSON.stringify(sessionData));
            callback?.();
            console.log("Session set successfully");
        } catch (err: unknown) {
            callback?.(err as Error);
            console.log("Error setting session:", err);
        }
    }
    //
    async touch(sessionId: string, sessionData: unknown, callback?: (err?: Error) => void) {
        console.log("Touching session:", sessionId);
        await this.set(sessionId, sessionData, callback);
    }
    //
    async destroy(sessionId: string, callback?: (err?: Error) => void) {
        console.log("Destroying session:", sessionId);
        try {
            await this.memcached.delete(`session:${sessionId}`);
            callback?.();
            console.log("Session destroyed successfully");
        } catch (err: unknown) {
            callback?.(err as Error);
            console.log("Error destroying session:", err);
        }
    }
    //
    async get(sessionId: string, callback?: (err: any, session?: any) => void) {
        console.log("Getting session:", sessionId);
        try {
            const data = await this.memcached.get(`session:${sessionId}`);
            console.log("Raw session data:", data);
            const session = data ? JSON.parse(data as string) : null;
            callback?.(null, session);
            console.log("Session retrieved successfully:", sessionId, session);
        } catch (err) {
            callback?.(err);
            console.log("Error getting session:", err);
        }
    }
}
