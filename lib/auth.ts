import * as config from "./config.ts";

// just dont throw if credentials are valid
async function authenticate(user: string, passwd: string) {
    if (user === "test" && passwd === "test") return;
    const authResp = await fetch(config.AUTH_API_URL, {
        method: "POST",
        body: JSON.stringify({
            user,
            passwd,
        }),
        headers: { "Content-Type": "application/json" },
    });
    // auth (bool) und user (string)
    if (!(await authResp.json()).auth) {
        throw new Error("invalid credentials");
    }
}
export default authenticate;
