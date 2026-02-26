/**
 * Test utilities and helpers
 */

import { assertEquals, assertExists } from "@std/assert";
import * as config from "../lib/config.ts";

const TEST_HOST = config.APP_HOST === "0.0.0.0" ? "localhost" : config.APP_HOST;
export const BASE_URL = `http://${TEST_HOST}:${config.APP_PORT}${config.APP_PATH}`;
export const TEST_USERS = [
    { user: "test", password: "test" },
    { user: "grafg", password: "grafg" },
];

/**
 * Store for session cookies between requests
 */
const cookieStore = new Map<string, string>();

/**
 * Make an HTTP request with optional authentication
 */
export async function fetchWithAuth(
    path: string,
    options: RequestInit = {},
    username?: string,
): Promise<Response> {
    const url = `${BASE_URL}${path}`;
    const headers = new Headers(options.headers);

    // Add auth cookie if username provided and we have a session
    if (username && cookieStore.has(username)) {
        headers.set("Cookie", cookieStore.get(username)!);
    }

    // Add HX-Request header for HTMX requests by default
    if (!headers.has("HX-Request")) {
        headers.set("HX-Request", "true");
    }

    const response = await fetch(url, {
        ...options,
        headers,
        redirect: "manual",
    });

    return response;
}

/**
 * Login a test user and store session cookie
 */
export async function loginUser(username: string, password: string): Promise<Response> {
    const response = await fetchWithAuth(
        "/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ username: username, password: password }),
        },
    );

    // Store session cookie
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
        cookieStore.set(username, setCookie);
    }

    return response;
}

/**
 * Logout a user and clear their session
 */
export async function logoutUser(username: string): Promise<Response> {
    const response = await fetchWithAuth("/logout", { method: "POST" }, username);
    cookieStore.delete(username);
    return response;
}

/**
 * Assert response has expected status code
 */
export function assertStatus(response: Response, expected: number, message?: string): void {
    assertEquals(
        response.status,
        expected,
        message || `Expected status ${expected} but got ${response.status}`,
    );
}

/**
 * Assert response contains expected text
 * This consumes the response body
 */
export async function assertBodyContains(response: Response, expected: string, message?: string): Promise<void> {
    const body = await response.text();
    const includes = body.includes(expected);
    assertEquals(
        includes,
        true,
        message || `Expected body to contain "${expected}"`,
    );
}

/**
 * Assert response has Set-Cookie header
 */
export function assertHasSessionCookie(response: Response, message?: string): void {
    const setCookie = response.headers.get("Set-Cookie");
    assertExists(setCookie, message || "Expected Set-Cookie header");
}

/**
 * Clear all stored sessions
 */
export function clearSessions(): void {
    cookieStore.clear();
}

/**
 * Combined assertion: Check status and body content
 * This properly handles body consumption
 */
export async function assertResponse(
    response: Response,
    expectedStatus: number,
    expectedBody?: string,
    message?: string,
): Promise<void> {
    assertStatus(response, expectedStatus);
    if (expectedBody) {
        await assertBodyContains(response, expectedBody, message);
    } else {
        // Consume body even if not checking content
        await response.body?.cancel();
    }
}
