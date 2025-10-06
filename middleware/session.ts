import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { v4 as uuidv4 } from "uuid";
import { Client } from "memjs";
import { Buffer } from "node:buffer";

import { defaultCookieOptions as cookieOpts } from "../lib/cookieOptions.ts";
import * as config from "../lib/config.ts";

const memjs = Client.create("localhost:11211");

export interface ISession {
    username?: string;
    isAdmin?: boolean;
}

export class Session {
    c: Context;
    sessionId: string;
    #username: string = "";
    #isAdmin: boolean = false; // TODO: get from DB
    // need those guys in the after step
    _admins = ["georg", "graf georg"];
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
        if (this._admins.includes(username.toLowerCase())) { // TODO: get from DB
            this.#isAdmin = true;
        }
        this.#username = username;
    }
    isAdmin(): boolean {
        return this.#isAdmin;
    }
    login(username: string): void {
        this.username = username;
        this.gotLogin = true;
    }
    logout(): void {
        this.gotLogout = true;
    }
    toJSON(): ISession {
        return {
            username: this.#username,
        };
    }
    renderJSON(): ISession {
        return {
            username: this.#username,
            isAdmin: this.#isAdmin,
        };
    }

    save(): Promise<void> {
        const id = this.sessionId;
        const value = JSON.stringify(this);
        return new Promise((resolve, reject) => {
            try {
                memjs.set(
                    id,
                    Buffer.from(value),
                    {},
                    function (err: unknown, val: unknown) {
                        if (err) {
                            console.error(`Error saving ${id} to Memcached:`, err);
                            return reject(err);
                        } else {
                            console.log(`SUCCESS saving ${id} to Memcached:`, val);
                            return resolve();
                        }
                    },
                );
            } catch (e) {
                console.error(`Error saving session ${id}:`, e);
                return reject(e);
            }
        });
    }
    async sendCookie() {
        await setSignedCookie(this.c, config.COOKIE_NAME, this.sessionId, config.COOKIE_SECRET, cookieOpts);
    }
    delete(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                memjs.delete(this.sessionId, (err: unknown, val: unknown) => {
                    if (err) {
                        console.error(`Error deleting session ${this.sessionId}:`, err);
                        return reject(err);
                    } else {
                        console.log(`SUCCESS deleting session ${this.sessionId}:`, val);
                        return resolve();
                    }
                });
            } catch (e) {
                console.error(`Error deleting session ${this.sessionId}:`, e);
                return reject(e);
            }
        });
    }
    static load(
        id: string,
        c: Context, // id comes from cookie
    ): Promise<Session> {
        return new Promise((resolve, reject) => {
            try {
                memjs.get(id, (err: unknown, value: Buffer) => {
                    if (value) {
                        // console.log(`loadSession ${id} got '${value.toString("utf8")}'.`);
                        try {
                            const session = new Session(c, id);
                            Object.assign(session, JSON.parse(value.toString("utf8")));
                            session.loadedFromStore = true;
                            return resolve(session);
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        console.log(`loadSession ERR ${err}`);
                        return reject(err);
                    }
                });
            } catch (e) {
                console.error(`Error loading session ${id}:`, e);
                return reject(e);
            }
        });
    }

    static async middleware(
        c: Context,
        next: () => Promise<void>,
    ): Promise<void> {
        let session: Session | null = null;
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
            await session.delete();
            await deleteCookie(c, config.COOKIE_NAME, cookieOpts);
            console.log(
                `Session and cookie deleted: ${session.sessionId}`,
            );
            return;
        }
        if (!session.username) {
            if (session.idIsFromCookie) {
                await deleteCookie(c, config.COOKIE_NAME, cookieOpts);
            }
            if (session.loadedFromStore) {
                await session.delete();
            }
            return;
        }
        if (session.needsSave) {
            await session.save();
        }
    }
}
