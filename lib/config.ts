// Environment configuration
// All environment variables exported as individual constants
export const NODE_ENV = Deno.env.get("NODE_ENV") || "development";
export const APP_HOST = Deno.env.get("APP_HOST") || "localhost";
export const APP_PORT = Number(Deno.env.get("APP_PORT")) || 8000;
export const APP_PATH = Deno.env.get("APP_PATH") || "";
export const COOKIE_NAME = Deno.env.get("COOKIE_NAME") || "session";
export const COOKIE_SECRET = Deno.env.get("COOKIE_SECRET") || "";
export const COOKIE_MAX_AGE = Deno.env.get("COOKIE_MAX_AGE") || "4 weeks";
export const AUTH_API_URL = Deno.env.get("AUTH_API_URL") || "";
export const MEMCACHE_PREFIX = Deno.env.get("MEMCACHE_PREFIX") || "watchtracker";
export const MEMCACHE_HOST = Deno.env.get("MEMCACHE_HOST") || "127.0.0.1";
export const MEMCACHE_PORT = Number(Deno.env.get("MEMCACHE_PORT")) || 11211;
export const partialsDir = "./views";
