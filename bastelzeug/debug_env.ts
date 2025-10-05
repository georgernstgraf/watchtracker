import * as config from "../lib/config.ts";

// Debug environment variables
console.log("Environment variables:");
console.log("COOKIE_NAME:", config.COOKIE_NAME);
console.log("COOKIE_SECRET:", config.COOKIE_SECRET);
console.log("COOKIE_MAX_AGE:", config.COOKIE_MAX_AGE);
console.log("APP_PATH:", config.APP_PATH);
console.log("NODE_ENV:", config.NODE_ENV);
