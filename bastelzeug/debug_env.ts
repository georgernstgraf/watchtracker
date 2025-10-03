// Debug environment variables
console.log("Environment variables:");
console.log("COOKIE_NAME:", Deno.env.get("COOKIE_NAME"));
console.log("COOKIE_SECRET:", Deno.env.get("COOKIE_SECRET"));
console.log("COOKIE_MAX_AGE:", Deno.env.get("COOKIE_MAX_AGE"));
console.log("APP_PATH:", Deno.env.get("APP_PATH"));
console.log("NODE_ENV:", Deno.env.get("NODE_ENV"));
