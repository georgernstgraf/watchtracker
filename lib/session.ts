import ms from "ms";
import expressSession from "express-session";
import connectMemcached from "connect-memcached";
import { EventEmitter } from "node:events";

// Handle ES module import of CommonJS factory function
const connectMemcachedFactory = (connectMemcached as any).deffault || connectMemcached;
const BaseMemcachedStore = connectMemcachedFactory(expressSession);

// Fix the prototype chain - the library uses deprecated __proto__ which doesn't work in Deno
// We need to manually copy EventEmitter methods to the prototype
const Store = expressSession.Store;
Object.getOwnPropertyNames(EventEmitter.prototype).forEach((name) => {
    if (name !== "constructor" && !BaseMemcachedStore.prototype[name]) {
        BaseMemcachedStore.prototype[name] = EventEmitter.prototype[name];
    }
});

// Also copy Store prototype methods if needed
Object.getOwnPropertyNames(Store.prototype).forEach((name) => {
    if (name !== "constructor" && !BaseMemcachedStore.prototype[name]) {
        BaseMemcachedStore.prototype[name] = Store.prototype[name];
    }
});

const MemcachedStore = BaseMemcachedStore;
export const session = expressSession({
    name: process.env.COOKIE_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    proxy: process.env.NODE_ENV === "production",
    cookie: {
        maxAge: ms(process.env.COOKIE_MAX_AGE),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: process.env.APP_PATH,
    },
    store: new MemcachedStore({
        hosts: ["127.0.0.1:11211"],
    }),
});
export const logoutCookie = {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: process.env.APP_PATH,
};
