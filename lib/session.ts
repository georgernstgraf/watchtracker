import ms from "ms";
import expressSession from "express-session";
import connect_memcached from "connect-memcached";
const MemcachedStore = connect_memcached(expressSession);
ms(process.env.COOKIE_MAX_AGE) / 1000;
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
