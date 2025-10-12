import handlebars from "handlebars";
import { walk } from "@std/fs";
import { partialsDir } from "./config.ts";

export const map = new Map();
export function render(templateName: string, context: object): string {
    return map.get(templateName)(context);
}

async function listHBSFilesRecursive(dir: string): Promise<string[]> {
    const dirEntries: string[] = [];
    for await (const entry of walk(dir, { exts: [".hbs"], includeDirs: false })) {
        // entry: { path, name, isFile, isDirectory, isSymlink }
        if (entry.isFile) {
            dirEntries.push(entry.path);
        }
    }
    return dirEntries;
}

async function loadTemplates() {
    const templatesDir = partialsDir;
    const hbsFiles = await listHBSFilesRecursive(templatesDir);
    for (const file of hbsFiles) {
        const templateName = file.replace(`${templatesDir.substring(2)}/`, "").replace(".hbs", "");
        const templateSource = Deno.readTextFileSync(file);
        const template = handlebars.compile(templateSource);
        map.set(templateName, template);
        handlebars.registerPartial(templateName, template);
    }
}
loadTemplates()
    .then(() => console.log("Templates loaded successfully:", [...map.keys()]))
    .catch((err) => {
        console.error("Error loading templates:", err);
        Deno.exit(1);
    });
