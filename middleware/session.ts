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
    username?: string;
};
export type SessionDataAuth = {
    username: string;
};

function shortId(arg: string): string {
    return arg.split("-")[2];
}

export class Session<T> {
    c: Context;
    #sessionId: string;
    #data: SessionData | SessionDataAuth = {};
    #needs_store_save = false;
    #needs_cookie_send;
    #cookie_type: "normal" | "logoout" = "normal";

    constructor(c: Context, sessionId?: string) {
        if (!sessionId) {
            this.#needs_cookie_send = true;
            sessionId = uuidv4();
        } else {
            this.#needs_cookie_send = false;
        }
        this.#sessionId = sessionId;
        this.c = c;
    }

    get username(): string | undefined {
        return this.#data.username;
    }

    get id(): string {
        return this.#sessionId;
    }

    get shortId(): string {
        return shortId(this.#sessionId);
    }

    login(username: string) {
        this.#data.username = username;
        this.#needs_store_save = true;
    }

    logout(): void {
        this.#cookie_type = "logoout";
        this.#needs_cookie_send = true;
        this.#needs_store_save = true;
    }

    #sessionDataString() {
        return JSON.stringify(this.#data);
    }

    async #save_to_mcd(): Promise<void> {
        await store.persistSessionData(this.#sessionId, this.#sessionDataString());
    }

    async #sendCookie() {
        const cookie_options = this.#cookie_type == "normal" ? defaultCookieOptions : logoutCookieOptions;
        await setSignedCookie(this.c, config.COOKIE_NAME, this.#sessionId, config.COOKIE_SECRET, cookie_options);
    }

    async #remove_from_store(): Promise<void> {
        await store.deleteSession(this.#sessionId);
    }

    static async from_mcd(
        id: string,
        c: Context, // id comes from cookie
    ): Promise<Session<SessionDataAuth> | null> {
        const sessionData = await store.getSessionDataById(id);
        if (!sessionData) {
            return null;
        }
        const session = new Session(c, id);
        session.#data = JSON.parse(sessionData) as SessionDataAuth;
        return session;
    }

    static async middleware(
        c: Context,
        next: () => Promise<void>,
        enforce_auth: boolean,
    ) {
        let session = undefined;
        const request_url = `${c.req.method} ${c.req.path}`;

        console.log(
            `=========== SESSION MW START: ${request_url} ===========`,
        );
        const sessionIdFromCookie = await getSignedCookie(c, config.COOKIE_SECRET, config.COOKIE_NAME);
        // ------- BEFORE REQ --------
        if (sessionIdFromCookie) { // from cookie
            console.log(`SESSION: ${request_url} (${shortId(sessionIdFromCookie)}) FROM COOKIE`);
            session = await Session.from_mcd(
                sessionIdFromCookie,
                c,
            );
            if (session) {
                console.log(`SESSION: STORE_FOUND (${session.shortId}) (${request_url})`);
            } else {
                console.log(`SESSION: STORE_MISS (${shortId(sessionIdFromCookie)}) (${request_url})`);
                session = new Session(c, sessionIdFromCookie);
            }
        } else {
            session = new Session(c);
            console.log(`SESSION: NO COOKIE (${request_url}) new id: ${session.shortId}`);
        }
        if (enforce_auth && !session.username) {
            return c.text("Unauthorized", 401);
        }
        c.set("session", session);
        console.log(`    >>>>>>> SESSION NOW NEXT: ${request_url} <<<<<<<`);
        await next();
        console.log(`    >>>>>>> SESSION AFTER NEXT: ${request_url} <<<<<<<`);
        // ------- AFTER REQ --------
        if (session.#needs_cookie_send) {
            console.log(`SESSION: ${request_url} I will send a cookie (${session.shortId})`);
            await session.#sendCookie();
        }

        if (session.#needs_store_save) {
            await session.#save_to_mcd();
            console.log(`SESSION: ${request_url} modified, storing (${session.shortId})`);
        }
        console.log(`=========== SESSION MW END: ${request_url} ===========`);
    }
}
