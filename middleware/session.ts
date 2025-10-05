import expressSession from "express-session";
import { defaultCookieOptions } from "../lib/cookies.ts";
import mySessionStore from "../lib/memcachedSessionStore.ts";
import * as config from "../lib/config.ts";

const session = expressSession({
    name: config.COOKIE_NAME,
    resave: false, // dont save if not modified
    saveUninitialized: false, // dont write to store if not modified
    secret: config.COOKIE_SECRET,
    proxy: config.NODE_ENV === "production",
    cookie: defaultCookieOptions,
    store: new mySessionStore(),
});
export default session;
