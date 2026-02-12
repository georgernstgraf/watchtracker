import * as config from "./config.ts";
import { testsaslauthd } from "./testsaslauthd.ts";

// Test users for non-production environments
const TEST_USERS = [
    { user: "test", passwd: "test" },
    { user: "grafg", passwd: "grafg" },
];

/**
 * Check if credentials match a test user
 */
function isTestUser(user: string, passwd: string): boolean {
    return TEST_USERS.some((tu) => tu.user === user && tu.passwd === passwd);
}

/**
 * Authenticate user credentials
 * In non-production: try test users first, then fall back to API
 * In production: rely solely on API
 */
async function authenticate(user: string, passwd: string) {
    // In non-production environments, check test users first
    if (!config.isProduction && isTestUser(user, passwd)) {
        return;
    }

    // Try saslauthd authentication
    if (await testsaslauthd(user, passwd)) {
        return;
    }

    // Fall back to API authentication
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
