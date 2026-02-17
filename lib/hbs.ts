import hbs from "handlebars";
import { walk } from "@std/fs";
import { partialsDir } from "./config.ts";
import * as config from "./config.ts";
// map "template name" => compiled template function
const map = new Map<string, hbs.TemplateDelegate>();

const hbsData = { appPath: config.APP_PATH };
export { hbsData as renderData };

/**
 * Render a template with typed data
 */
export function render<T>(templateName: string, data: T): string {
    const template = map.get(templateName);
    if (!template) {
        throw new Error(`Template not found: ${templateName}`);
    }
    return template(data);
}

async function loadTemplates(): Promise<void> {
    const templatesDir = partialsDir;
    const hbsFiles = await listHBSFilesRecursive(templatesDir);
    for (const file of hbsFiles) {
        const templateName = file.replace(`${templatesDir.substring(2)}/`, "").replace(".hbs", "");
        const templateSource = Deno.readTextFileSync(file);
        const template = hbs.compile(templateSource);
        map.set(templateName, template);
        hbs.registerPartial(templateName, template);
    }
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

hbs.registerHelper("let", function (this: unknown, options: hbs.HelperOptions) {
    const context = Object.assign({}, this, options.hash);
    return options.fn(context);
});

hbs.registerHelper("or", function (...args: unknown[]) {
    return args.slice(0, -1).some(Boolean);
});

hbs.registerHelper("not", function (value: unknown) {
    return !value;
});

hbs.registerHelper("eq", function (a: unknown, b: unknown) {
    return a === b;
});

hbs.registerHelper("formatDate", function (dateString: string) {
    if (!dateString || dateString === "undefined" || dateString === "null") {
        return "Invalid Date";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    const day = date.getDate();
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}. ${month}, ${hours}:${minutes}`;
});

hbs.registerHelper("plusOne", function (val: number) {
    if (val === 0) return 1;
    return val;
});

hbs.registerHelper("getInitials", function (name: string) {
    if (!name || typeof name !== "string") return "??";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
});

hbs.registerHelper("toBase64", function (bytes: Uint8Array | null | undefined) {
    if (!bytes) return "";
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
});

hbs.registerHelper("deviationColor", function (value: number) {
    if (value > 0) return "text-success";
    if (value < 0) return "text-danger";
    return "text-light";
});

hbs.registerHelper("deviationArrow", function (value: number) {
    if (value > 0) return new hbs.SafeString("&#8593;"); // ↑
    if (value < 0) return new hbs.SafeString("&#8595;"); // ↓
    return "";
});

hbs.registerHelper("abs", function (value: number) {
    return Math.abs(value);
});

try {
    await loadTemplates();
    console.log(`HBS: Templates loaded successfully:, ${JSON.stringify([...map.keys()])}`);
} catch (err) {
    console.error(`HBS: Error loading templates:`, err);
    Deno.exit(1);
}
