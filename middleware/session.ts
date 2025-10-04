import ms from "ms";
import expressSession from "express-session";
import { defaultCookieOptions, logoutCookieOptions } from "../lib/cookies.ts";
// import connectMemcached from "connect-memcached";
// import { EventEmitter } from "node:events";

// Temporarily use memory store instead of memcached to isolate the cookie issue
// const connectMemcachedFactory = (connectMemcached as any).deffault || connectMemcached;
// const BaseMemcachedStore = connectMemcachedFactory(expressSession);

// Fix the prototype chain - the library uses deprecated __proto__ which doesn't work in Deno
// We need to manually copy EventEmitter methods to the prototype
// const Store = expressSession.Store;
// Object.getOwnPropertyNames(EventEmitter.prototype).forEach((name) => {
//     if (name !== "constructor" && !BaseMemcachedStore.prototype[name]) {
//         BaseMemcachedStore.prototype[name] = EventEmitter.prototype[name];
//     }
// });

// Also copy Store prototype methods if needed
// Object.getOwnPropertyNames(Store.prototype).forEach((name) => {
//     if (name !== "constructor" && !BaseMemcachedStore.prototype[name]) {
//         BaseMemcachedStore.prototype[name] = Store.prototype[name];
//     }
// });

// const MemcachedStore = BaseMemcachedStore;
const session = expressSession({
    name: Deno.env.get("COOKIE_NAME"),
    resave: false,
    saveUninitialized: true, // Allow session creation without user data
    secret: Deno.env.get("COOKIE_SECRET"),
    proxy: Deno.env.get("NODE_ENV") === "production",
    cookie: defaultCookieOptions,
    // Temporarily using memory store instead of memcached
    // store: new MemcachedStore({
    //     hosts: ["127.0.0.1:11211"],
    // }),
});
export default session;
