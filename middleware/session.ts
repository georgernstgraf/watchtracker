/*
 Session Class
 */

import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { v4 as uuidv4 } from "uuid";
import store from "../lib/memcachedSessionStore.ts";
import { defaultCookieOptions, logoutCookieOptions } from "../lib/cookieOptions.ts";
import * as config from "../lib/config.ts";

export type SessionData = {
    username: string;
};

export class Session {
    c: Context;
    sessionId: string;
    #username: string = "";
    gotLogin = false;
    gotLogout = false;
    needsSave = false;
    idIsFromCookie = false;
    loadedFromStore = false;

    constructor(c: Context, sessionId?: string) {
        if (!sessionId) {
            sessionId = uuidv4();
        } else {
            this.idIsFromCookie = true;
        }
        this.sessionId = sessionId;
        this.c = c;
    }
    get username(): string {
        return this.#username;
    }
    set username(username: string) {
        this.#username = username;
    }
    login(username: string): void {
        this.username = username;
        this.gotLogin = true;
    }
    logout(): void {
        this.gotLogout = true;
    }
    sessionDataString() {
        return JSON.stringify({
            username: this.username,
        });
    }
    async save(): Promise<void> {
        const id = this.sessionId;
        await store.persistSessionData(id, this.sessionDataString());
    }
    async sendCookie() {
        await setSignedCookie(this.c, config.COOKIE_NAME, this.sessionId, config.COOKIE_SECRET, defaultCookieOptions);
    }
    /**
     * Deletes the session from the memcached store.
     *
     * @returns A promise that resolves when the session is successfully deleted,
     * or rejects with an error if the deletion fails.
     *
     * @remarks
     * This method removes the session data associated with the current sessionId
     * from the memcached store. Success and error messages are logged to the console.
     *
     * @throws {Error} If the memcached delete operation fails or if an exception
     * occurs during the deletion process.
     */
    async remove_from_store(): Promise<void> {
        await store.deleteSession(this.sessionId);
    }
    static async load(
        id: string,
        c: Context, // id comes from cookie
    ): Promise<Session> {
        const sessionData = await store.getSessionDataById(id);
        if (!sessionData) {
            throw new Error(`Session not found: ${id}`);
        }
        const session = new Session(c, id);
        Object.assign(session, sessionData);
        session.loadedFromStore = true;
        return session;
    }

    static async middleware(
        c: Context,
        next: () => Promise<void>,
    ): Promise<void> {
        let session = undefined;
        console.log(
            `Session middleware started: ${c.req.method} ${c.req.path}`,
        );
        const sessionIdFromCookie = await getSignedCookie(c, config.COOKIE_SECRET, config.COOKIE_NAME);
        // ------- BEFORE REQ --------
        // We have sessionId OR NOT
        // console.log(`Handling sessionId from cookie: ${sessionIdFromCookie}`);
        if (sessionIdFromCookie) { // from cookie
            try {
                session = await Session.load(
                    sessionIdFromCookie,
                    c,
                );
            } catch (e) {
                console.warn(`WEIRD: sid (${sessionIdFromCookie}) from cookie gone from store (${e})`);
                session = new Session(c, sessionIdFromCookie);
            }
        } else {
            session = new Session(c);
        }
        c.set("session", session);
        await next();
        // ------- AFTER REQ --------
        if (session.gotLogin) {
            await session.save();
            await session.sendCookie();
            console.log(
                `Session saved & cookie sent: ${session.sessionId} with payload: ${JSON.stringify(session)}`,
            );
            return;
        }
        if (session.gotLogout) {
            await session.remove_from_store();
            await deleteCookie(session.c, config.COOKIE_NAME, logoutCookieOptions);
            console.log(
                `Session and cookie deleted: ${session.sessionId}`,
            );
            return;
        }
        if (!session.username) {
            if (session.idIsFromCookie) {
                await deleteCookie(c, config.COOKIE_NAME, defaultCookieOptions);
            }
            if (session.loadedFromStore) {
                await session.remove_from_store();
            }
            return;
        }
        if (session.needsSave) {
            await session.save();
        }
    }
}
