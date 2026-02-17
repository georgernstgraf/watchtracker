/**
 * Tests for watch routes (read-only operations)
 * Note: Write operations (POST, PATCH, DELETE) require database reset between runs
 */

import { describe, it } from "@std/testing/bdd";
import {
    assertStatus,
    assertBodyContains,
    fetchWithAuth,
    loginUser,
    clearSessions,
    TEST_USERS,
} from "./helpers.ts";

// Watch ID for user grafg - using a stable watch for read-only tests
const TEST_WATCH_ID = "cm9s81bh3000r13la5wqn10fj"; // Manero

describe("Watch Routes (Read-Only)", { sanitizeResources: false, sanitizeOps: false }, () => {
    it("GET /watches returns list of watches when authenticated", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        const response = await fetchWithAuth("/watches", {}, user.user);
        assertStatus(response, 200);
        await assertBodyContains(response, "Manero"); // Should contain test watch
    });

    it("GET /watches with sort parameter works", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        const response = await fetchWithAuth("/watches?sort=recent_desc", {}, user.user);
        assertStatus(response, 200);
        await response.body?.cancel();
    });

    it("GET /watch/:id returns watch details", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        const response = await fetchWithAuth(`/watch/${TEST_WATCH_ID}`, {}, user.user);
        assertStatus(response, 200);
        await assertBodyContains(response, "Manero");
    });

    it("GET /watch/:id with invalid ID returns 403", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        const response = await fetchWithAuth("/watch/invalid-id", {}, user.user);
        assertStatus(response, 403);
        await response.body?.cancel();
    });

    // Cleanup
    it("cleanup", () => {
        clearSessions();
    });
});

describe("Watch Routes (Write Operations)", { sanitizeResources: false, sanitizeOps: false }, () => {
    // These tests modify data and should only be run with a fresh database
    // or with a test database setup

    it("POST /watch creates a new watch", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        
        const uniqueName = `Test Watch ${Date.now()}`;
        const response = await fetchWithAuth(
            "/watch",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    name: uniqueName,
                    comment: "Created by automated test",
                }),
            },
            user.user
        );
        assertStatus(response, 200);
        await assertBodyContains(response, uniqueName);
    });

    it("PATCH /watch/:id updates a watch", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        
        // First get a watch ID from the watches list
        const watchesResponse = await fetchWithAuth("/watches", {}, user.user);
        const watchesBody = await watchesResponse.text();
        
        // Extract first watch ID from response (from hx-get URL: /watch/{{id}})
        const watchIdMatch = watchesBody.match(/\/watch\/([^'"]+)/);
        if (!watchIdMatch) {
            throw new Error("Could not find watch ID");
        }
        const watchId = watchIdMatch[1];
        
        const response = await fetchWithAuth(
            `/watch/${watchId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    name: "Updated Test Watch",
                    comment: "Updated by automated test",
                }),
            },
            user.user
        );
        assertStatus(response, 200);
        await assertBodyContains(response, "Updated Test Watch");
    });

    it("DELETE /watch/:id deletes a watch", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.password);
        
        // First create a watch to delete with unique name
        const uniqueName = `DeleteMe${Date.now()}`;
        await fetchWithAuth(
            "/watch",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    name: uniqueName,
                    comment: "Will be deleted by test",
                }),
            },
            user.user
        );
        
        // Now fetch the watches list to find the created watch
        const listResponse = await fetchWithAuth("/watches", {}, user.user);
        const listBody = await listResponse.text();
        
        // Find the watch ID - look for hx-get attribute containing /watch/ID
        // The HTML looks like: hx-get='/watchtracker/watch/abc123'
        const watchMatch = listBody.match(/\/watch\/([a-z0-9]+)/);
        if (!watchMatch) {
            throw new Error("Could not find any watch ID in list");
        }
        const watchId = watchMatch[1];
        
        // Now delete it
        const response = await fetchWithAuth(
            `/watch/${watchId}`,
            {
                method: "DELETE",
            },
            user.user
        );
        assertStatus(response, 200);
        await response.body?.cancel();
    });

    // Cleanup
    it("cleanup", () => {
        clearSessions();
    });
});
