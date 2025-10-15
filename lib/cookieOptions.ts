import * as config from "./config.ts";

export const defaultCookieOptions = {
    maxAge: config.COOKIE_MAX_AGE_S,
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict" as const,
    path: config.APP_PATH,
};
export const logoutCookieOptions = {
    maxAge: 0,
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict" as const,
    path: config.APP_PATH,
};
