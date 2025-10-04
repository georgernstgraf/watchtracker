import ms from "ms";

export const defaultCookieOptions = {
    maxAge: ms(Deno.env.get("COOKIE_MAX_AGE") || "4 weeks"),
    httpOnly: true,
    secure: Deno.env.get("NODE_ENV") === "production",
    sameSite: "strict" as const,
    path: Deno.env.get("APP_PATH"),
};
export const logoutCookieOptions = {
    maxAge: 0,
    httpOnly: true,
    secure: Deno.env.get("NODE_ENV") === "production",
    sameSite: "strict" as const,
    path: Deno.env.get("APP_PATH"),
};
