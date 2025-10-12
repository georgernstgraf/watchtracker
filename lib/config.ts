import ms from "ms";

export const DENO_ENV = Deno.env.get("DENO_ENV") || "development";

export const APP_HOST = Deno.env.get("APP_HOST") || "localhost";
export const APP_PORT = Number(Deno.env.get("APP_PORT")) || 8000;
export const APP_PATH = Deno.env.get("APP_PATH") || "";

export const AUTH_API_URL = Deno.env.get("AUTH_API_URL") || "";

export const COOKIE_NAME = Deno.env.get("COOKIE_NAME") || "session";
export const COOKIE_SECRET = Deno.env.get("COOKIE_SECRET") || "";

export const COOKIE_MAX_AGE = Deno.env.get("COOKIE_MAX_AGE") || "4 weeks";
export const COOKIE_MAX_AGE_MS = ms(COOKIE_MAX_AGE);
export const COOKIE_MAX_AGE_S = Math.floor(COOKIE_MAX_AGE_MS / 1000);

export const MEMCACHE_PREFIX = Deno.env.get("MEMCACHE_PREFIX") || "watchtracker";
export const MEMCACHE_HOST = Deno.env.get("MEMCACHE_HOST") || "127.0.0.1";
export const MEMCACHE_PORT = Number(Deno.env.get("MEMCACHE_PORT")) || 11211;

// derived
export const partialsDir = "./views";
export const isProduction = DENO_ENV === "production";
export const isDevelopment = DENO_ENV === "development";
