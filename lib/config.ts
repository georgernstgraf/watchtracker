import ms from "ms";

export const DENO_ENV = Deno.env.get("DENO_ENV") || "development";

export const APP_HOST = Deno.env.get("APP_HOST") || "localhost";
export const APP_PORT = Number(Deno.env.get("APP_PORT")) || 8000;
export const APP_PATH = Deno.env.get("APP_PATH") || "";

export const AUTH_API_URL = Deno.env.get("AUTH_API_URL") || "";

export const COOKIE_NAME = Deno.env.get("COOKIE_NAME") || "session";
export const COOKIE_SECRET = Deno.env.get("COOKIE_SECRET") || "";
export const COOKIE_MAX_AGE = Deno.env.get("COOKIE_MAX_AGE") || "4 weeks";
const _COOKIE_MAX_AGE_MS = ms(COOKIE_MAX_AGE);
if (!_COOKIE_MAX_AGE_MS) {
    console.error(`Invalid COOKIE_MAX_AGE format: "${COOKIE_MAX_AGE}". Use format like "4 weeks", "30 days", "1 year".`);
    Deno.exit(1);
}
export const COOKIE_MAX_AGE_MS = _COOKIE_MAX_AGE_MS;
export const COOKIE_MAX_AGE_S = Math.floor(COOKIE_MAX_AGE_MS / 1000);

export const SESSION_REFRESH_THRESHOLD = Deno.env.get("SESSION_REFRESH_THRESHOLD") || "1 week";
const _SESSION_REFRESH_THRESHOLD_MS = ms(SESSION_REFRESH_THRESHOLD);
if (!_SESSION_REFRESH_THRESHOLD_MS) {
    console.error(`Invalid SESSION_REFRESH_THRESHOLD format: "${SESSION_REFRESH_THRESHOLD}". Use format like "1 week", "7 days".`);
    Deno.exit(1);
}
export const SESSION_REFRESH_THRESHOLD_MS = _SESSION_REFRESH_THRESHOLD_MS;

export const MEMCACHE_PREFIX = Deno.env.get("MEMCACHE_PREFIX") || "watchtracker";
export const MEMCACHE_HOST = Deno.env.get("MEMCACHE_HOST") || "127.0.0.1";
export const MEMCACHE_PORT = Number(Deno.env.get("MEMCACHE_PORT")) || 11211;
// Memcached TTL must be <= 30 days (2592000s), otherwise it's treated as Unix timestamp
// We add 1 day buffer to cookie max age, but cap at 30 days max
export const MEMCACHE_TTL_S = 0;

// derived
export const partialsDir = "./views";
export const isProduction = DENO_ENV === "production";
export const isDevelopment = DENO_ENV === "development";

export const saslauthdMux = Deno.env.get("SASLAUTHD_MUX") || "/var/run/saslauthd/mux";
export const saslauthdLieTrue = Deno.env.get("SASLAUTHD_LIE_TRUE") === "true";
