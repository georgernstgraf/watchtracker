import { main } from "../main.ts";
main({
    host: Deno.env.get('APP_HOST') ?? 'localhost',
    port: Number(Deno.env.get('APP_PORT')) || 8000,
});
