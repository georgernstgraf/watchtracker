import * as config from "./config.ts";
import { defaultCookieOptions } from "./cookieOptions.ts";
import mySessionStore from "./memcachedSessionStore.ts";
export default {
    name: config.COOKIE_NAME,
    resave: false, // dont save if not modified
    saveUninitialized: false, // dont write to store if not modified
    secret: config.COOKIE_SECRET,
    proxy: config.NODE_ENV === "production",
    cookie: defaultCookieOptions,
    store: mySessionStore,
};
