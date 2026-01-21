import hbs from "handlebars";
import { walk } from "@std/fs";
import { partialsDir } from "./config.ts";
import { renderData } from "./types.ts";
import * as config from "./config.ts";
// map "template name" => compiled template function
const map = new Map();

const hbs_data = { appPath: config.APP_PATH };
export { hbs_data as renderData };

export function render(templateName: string, renderData: renderData): string {
    return map.get(templateName)(renderData);
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
    if (val == 0) return 1;
    return val;
});

try {
    await loadTemplates();
    console.log(`HBS: Templates loaded successfully:, ${JSON.stringify([...map.keys()])}`);
} catch (err) {
    console.error(`HBS: Error loading templates:`, err);
    Deno.exit(1);
}
