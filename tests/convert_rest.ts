#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Convert .rest files to Deno test cases
 * Usage: deno run --allow-read --allow-write tests/convert_rest.ts
 */

import { parseArgs } from "@std/cli/parse-args";

interface RestRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
}

/**
 * Parse a .rest file and extract requests
 */
function parseRestFile(content: string): RestRequest[] {
    const requests: RestRequest[] = [];
    const blocks = content.split("###").filter((b) => b.trim());

    for (const block of blocks) {
        const lines = block.trim().split("\n");
        if (lines.length === 0) continue;

        // Find the request line (first non-comment line with HTTP method)
        let requestLine = "";
        let bodyStart = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/^(GET|POST|PUT|PATCH|DELETE)\s+/)) {
                requestLine = line;
                bodyStart = i + 1;
                break;
            }
        }

        if (!requestLine) continue;

        // Parse method and URL
        const parts = requestLine.split(/\s+/);
        const method = parts[0];
        let url = parts[1];

        // Strip base URL if present (e.g. http://localhost:16631/watchtracker)
        url = url.replace(/^https?:\/\/[^\/]+(\/[^\/]+)?/, (match, p1) => {
            // If p1 matches APP_PATH, strip it all. 
            // This is a bit heuristic but better than hardcoded.
            return "";
        });

        // Parse headers
        const headers: Record<string, string> = {};
        let body = "";
        let inBody = false;

        for (let i = bodyStart; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === "" && !inBody) {
                inBody = true;
                continue;
            }

            if (inBody) {
                body += line + "\n";
            } else if (line.includes(":")) {
                const [key, ...valueParts] = line.split(":");
                headers[key.trim()] = valueParts.join(":").trim();
            }
        }

        requests.push({
            method,
            url,
            headers,
            body: body.trim() || undefined,
        });
    }

    return requests;
}

/**
 * Generate Deno test code from REST requests
 */
function generateTestCode(requests: RestRequest[]): string {
    let code = `// Auto-generated from .rest file
import { describe, it } from "@std/testing/bdd";
import { assertStatus, fetchWithAuth, loginUser, TEST_USERS } from "./helpers.ts";

describe("REST File Tests", () => {
`;

    for (let i = 0; i < requests.length; i++) {
        const req = requests[i];
        const testName = `${req.method} ${req.url}`;

        code += `    it("${testName}", async () => {
`;

        // If authenticated request, login first
        if (req.headers["Cookie"]) {
            code += `        const user = TEST_USERS[0];
        await loginUser(user.user, user.passwd);
`;
        }

        code += `        const response = await fetchWithAuth(
            "${req.url}",
            {
                method: "${req.method}",
`;

        if (Object.keys(req.headers).length > 0) {
            code += `                headers: ${JSON.stringify(req.headers)},
`;
        }

        if (req.body) {
            code += `                body: ${JSON.stringify(req.body)},
`;
        }

        code += `            }${req.headers["Cookie"] ? `, user.user` : ""}
        );
        // TODO: Adjust expected status code
        // assertStatus(response, 200);
    });

`;
    }

    code += `});
`;

    return code;
}

/**
 * Main function
 */
async function main() {
    const args = parseArgs(Deno.args, {
        string: ["input", "output"],
        default: {
            input: "tests/route.rest",
            output: "tests/route_rest_test.ts",
        },
    });

    try {
        const content = await Deno.readTextFile(args.input);
        const requests = parseRestFile(content);

        console.log(`Parsed ${requests.length} requests from ${args.input}`);

        const testCode = generateTestCode(requests);
        await Deno.writeTextFile(args.output, testCode);

        console.log(`Generated test file: ${args.output}`);
        console.log("\nRequests found:");
        for (const req of requests) {
            console.log(`  ${req.method} ${req.url}`);
        }
    } catch (error) {
        console.error("Error:", error);
        Deno.exit(1);
    }
}

if (import.meta.main) {
    main();
}
