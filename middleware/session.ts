import expressSession from "express-session";
import { defaultCookieOptions } from "../lib/cookies.ts";
import mySessionStore from "../lib/memcachedSessionStore.ts";
const session = expressSession({
    name: Deno.env.get("COOKIE_NAME"),
    resave: false, // dont save if not modified
    saveUninitialized: false, // dont write to store if not modified
    secret: Deno.env.get("COOKIE_SECRET"),
    proxy: Deno.env.get("NODE_ENV") === "production",
    cookie: defaultCookieOptions,
    store: mySessionStore,
});
export default session;
