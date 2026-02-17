import { UnauthorizedError } from "./errors.ts";
import * as config from "./config.ts";
import { testsaslauthd } from "./testsaslauthd.ts";

// Test users for non-production environments
const TEST_USERS = [
    { user: "test", password: "test" },
    { user: "grafg", password: "grafg" },
];

/**
 * Check if credentials match a test user
 */
function isTestUser(user: string, password: string): boolean {
    return TEST_USERS.some((testUser) => testUser.user === user && testUser.password === password);
}

/**
 * Authenticate user credentials
 * In non-production: try test users first, then fall back to API
 * In production: rely solely on API
 */
async function authenticate(user: string, password: string) {
    // In non-production environments, check test users first
    if (!config.isProduction && isTestUser(user, password)) {
        return;
    }

    // Try saslauthd authentication
    if (await testsaslauthd(user, password)) {
        return;
    }

    // Fall back to API authentication
    const authResponse = await fetch(config.AUTH_API_URL, {
        method: "POST",
        body: JSON.stringify({
            user,
            password,
        }),
        headers: { "Content-Type": "application/json" },
    });

    // auth (bool) und user (string)
    if (!(await authResponse.json()).auth) {
        throw new UnauthorizedError("invalid credentials");
    }
}

export default authenticate;
