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
