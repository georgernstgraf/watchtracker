/**
 * Development wrapper script
 * Runs Prisma generation and then starts the main application
 */

async function runPrismaGenerate() {
    console.log("🛠️ Verifying Prisma client...");
    const command = new Deno.Command("deno", {
        args: ["task", "p_g"],
        stdout: "inherit",
        stderr: "inherit",
    });

    const { success } = await command.spawn().status;
    if (!success) {
        console.error("❌ Prisma generation failed! Exiting.");
        Deno.exit(1);
    } else {
        console.log("✅ Prisma client ready.");
    }
}

// Run generation at startup
await runPrismaGenerate();

// Import the main application
// Note: We use dynamic import to ensure generation finishes first if needed, 
// though top-level await above already handles synchronization.
await import("../main.ts");
