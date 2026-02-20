import hbs from "handlebars";
import { walk } from "@std/fs";
import { partialsDir } from "./config.ts";
import * as config from "./config.ts";
import moment from "moment-timezone";
// templateCache "template name" => compiled template function
const templateCache = new Map<string, hbs.TemplateDelegate>();

const baseRenderData = { appPath: config.APP_PATH };
export { baseRenderData as renderData };

/**
 * Render a template with typed data
 */
export function render<T>(templateName: string, data: T): string {
    const template = templateCache.get(templateName);
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
        templateCache.set(templateName, template);
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

function parseDateInput(input: unknown): Date | null {
    if (!input || input === "undefined" || input === "null") {
        return null;
    }
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input === "string" || typeof input === "number") {
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}

function formatDateWithTimezone(dateInput: Date, timezone: string = "UTC", showTime: boolean = false): string {
    const date = parseDateInput(dateInput);
    if (!date) return "Invalid Date";

    const momentDate = moment(date).tz(timezone);
    const day = momentDate.date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const month = monthNames[momentDate.month()];
    const year = momentDate.year();
    const hours = momentDate.format("HH");
    const minutes = momentDate.format("mm");

    const now = moment().tz(timezone);
    const monthsDiff = (now.year() - year) * 12 + (now.month() - momentDate.month());
    const showYear = monthsDiff >= config.DATE_YEAR_THRESHOLD_MONTHS;

    if (showTime) {
        return showYear ? `${day}. ${month} ${year}, ${hours}:${minutes}` : `${day}. ${month}, ${hours}:${minutes}`;
    }
    return showYear ? `${day}. ${month} ${year}` : `${day}. ${month}`;
}

function formatDateTimeLocal(dateInput: Date, timezone: string = "UTC"): string {
    const date = parseDateInput(dateInput);
    if (!date) return "";

    const momentDate = moment(date).tz(timezone);
    const year = momentDate.year();
    const month = momentDate.format("MM");
    const day = momentDate.format("DD");
    const hours = momentDate.format("HH");
    const minutes = momentDate.format("mm");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

hbs.registerHelper("formatDate", function (dateInput: unknown, options: hbs.HelperOptions) {
    const timezone = options.hash?.timezone || "UTC";
    const showTime = options.hash?.showTime || false;
    return formatDateWithTimezone(dateInput as Date, timezone, showTime);
});

hbs.registerHelper("formatDateTimeLocal", function (dateInput: unknown, options: hbs.HelperOptions) {
    const timezone = options.hash?.timezone || "UTC";
    return formatDateTimeLocal(dateInput as Date, timezone);
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
    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
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
    console.log(`HBS: Templates loaded successfully:, ${JSON.stringify([...templateCache.keys()])}`);
} catch (err) {
    console.error(`HBS: Error loading templates:`, err);
    Deno.exit(1);
}
