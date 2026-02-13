/**
 * Tests for measurement routes (read-only operations)
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

// Test data from database
const TEST_WATCH_ID = "cm9s81bh3000r13la5wqn10fj"; // Manero (owned by grafg)
// const TEST_MEASUREMENT_ID = "clxivzt3p000ahmcf4gbho1os"; // First measurement

describe("Measurement Routes (Read-Only)", { sanitizeResources: false, sanitizeOps: false }, () => {
    it("POST /measure/:id returns measurements component", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.passwd);
        const response = await fetchWithAuth(
            `/measure/${TEST_WATCH_ID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    value: "5",
                    isStart: "false",
                    comment: "Test measurement",
                }),
            },
            user.user
        );
        assertStatus(response, 200);
        await assertBodyContains(response, "measurements-container");
    });

    // Cleanup
    it("cleanup", () => {
        clearSessions();
    });
});

describe("Measurement Routes (Write Operations)", { sanitizeResources: false, sanitizeOps: false }, () => {
    // These tests modify data and should only be run with a fresh database
    // or with a test database setup

    it("PATCH /measure/:id updates a measurement", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.passwd);
        
        // Create a measurement first to ensure we have a valid ID and ownership
        const createResponse = await fetchWithAuth(
            `/measure/${TEST_WATCH_ID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    value: "10",
                    isStart: "false",
                    comment: "To be updated",
                }),
            },
            user.user
        );
        assertStatus(createResponse, 200);
        const createBody = await createResponse.text();
        const measureIdMatch = createBody.match(/data-id="([^"]+)"/);
        if (!measureIdMatch) {
            throw new Error("Could not find created measurement ID for PATCH test");
        }
        const measureId = measureIdMatch[1];

        const response = await fetchWithAuth(
            `/measure/${measureId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    value: "20",
                    isStart: "false",
                    comment: "Updated by test",
                }),
            },
            user.user
        );
        assertStatus(response, 200);
        await response.body?.cancel();
    });

    it("DELETE /measure/:id deletes a measurement", async () => {
        const user = TEST_USERS[1]; // grafg
        await loginUser(user.user, user.passwd);
        
        // First create a measurement to delete
        const createResponse = await fetchWithAuth(
            `/measure/${TEST_WATCH_ID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    value: "42",
                    isStart: "false",
                    comment: "Will be deleted by test",
                }),
            },
            user.user
        );
        
        // Extract measurement ID from response
        const createBody = await createResponse.text();
        const measureIdMatch = createBody.match(/data-id="([^"]+)"/);
        if (!measureIdMatch) {
            throw new Error("Could not find created measurement ID");
        }
        const measureId = measureIdMatch[1];
        
        // Now delete it
        const response = await fetchWithAuth(
            `/measure/${measureId}`,
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
