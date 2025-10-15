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
    was_modified = false;
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

    async save_to_mcd(): Promise<void> {
        const id = this.sessionId;
        await store.persistSessionData(id, this.sessionDataString());
    }

    async sendCookie() {
        await setSignedCookie(this.c, config.COOKIE_NAME, this.sessionId, config.COOKIE_SECRET, defaultCookieOptions);
    }

    assertSessionUserIsPresent(): void {
        if (!this.username) {
            throw new Error("Session: No user present");
        }
    }

    async remove_from_store(): Promise<void> {
        await store.deleteSession(this.sessionId);
    }

    static async load_from_mcd(
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
        const request_url = `${c.req.method} ${c.req.path}`;

        console.log(
            `Session middleware started: ${request_url}`,
        );
        const sessionIdFromCookie = await getSignedCookie(c, config.COOKIE_SECRET, config.COOKIE_NAME);
        // ------- BEFORE REQ --------
        if (sessionIdFromCookie) { // from cookie
            console.log(`Session: ${request_url} Id from cookie: ${sessionIdFromCookie}`);
            try {
                session = await Session.load_from_mcd(
                    sessionIdFromCookie,
                    c,
                );
                console.log(`Session: ${request_url} loaded from store (${sessionIdFromCookie})`);
            } catch (e) {
                console.warn(`Session: ${request_url} WEIRD: sid (${sessionIdFromCookie}) from cookie gone from store (${e})`);
                session = new Session(c, sessionIdFromCookie);
            }
        } else {
            session = new Session(c);
            console.log(`Session: ${request_url} No Cookie, new id: ${session.sessionId}`);
        }
        c.set("session", session);
        await next();
        // ------- AFTER REQ --------
        if (session.gotLogin) {
            await session.save_to_mcd();
            await session.sendCookie();
            console.log(
                `Session: ${request_url} LOGIN: saved_to_mcd & cookie sent (${session.sessionId}) with payload: ${session.sessionDataString()}`,
            );
            return;
        }
        if (session.gotLogout) {
            await session.remove_from_store();
            await deleteCookie(session.c, config.COOKIE_NAME, logoutCookieOptions);
            console.log(
                `Session: ${request_url} LOGOUT: deleted_from_mcd & cookie removed (${session.sessionId})`,
            );
            return;
        }
        // there was no login/logout
        console.log(`Session: ${request_url} no login/logout happened (${session.sessionId})`);

        // I need to send the cookie if it is a new session
        if (!session.idIsFromCookie) {
            console.log(`Session: ${request_url} I will send a cookie (${session.sessionId})`);
            await session.sendCookie();
        }

        if (session.was_modified) {
            await session.save_to_mcd();
            console.log(`Session: ${request_url} modified, storing (${session.sessionId})`);
        }
    }
}
