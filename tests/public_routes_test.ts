/**
 * Tests for public routes
 */

import { describe, it } from "@std/testing/bdd";
import {
    assertStatus,
    assertBodyContains,
    assertHasSessionCookie,
    loginUser,
    logoutUser,
    clearSessions,
    TEST_USERS,
    BASE_URL,
} from "./helpers.ts";

describe("Public Routes", { sanitizeResources: false, sanitizeOps: false }, () => {
    it("GET / returns login page when not authenticated", async () => {
        const response = await fetch(BASE_URL + "/", {
            headers: { "HX-Request": "true" },
        });
        assertStatus(response, 200);
        await assertBodyContains(response, "Login");
    });

    it("POST /login with valid credentials succeeds", async () => {
        const user = TEST_USERS[0];
        const response = await loginUser(user.user, user.password);
        assertStatus(response, 200);
        assertHasSessionCookie(response);
        await assertBodyContains(response, "Watchtracker");
    });

    it("POST /login with invalid credentials fails", async () => {
        const response = await fetch(BASE_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "HX-Request": "true",
            },
            body: new URLSearchParams({ username: "invalid", password: "wrong" }),
        });
        assertStatus(response, 200);
        await assertBodyContains(response, "login failed");
    });

    it("POST /logout clears session", async () => {
        const user = TEST_USERS[0];
        await loginUser(user.user, user.password);
        const response = await logoutUser(user.user);
        assertStatus(response, 200);
        await assertBodyContains(response, "Login");
    });

    // Cleanup
    it("cleanup", () => {
        clearSessions();
    });
});
