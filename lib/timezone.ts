import moment from "moment-timezone";
import * as luxon from "luxon";

export class TimeZone {
    static timeZones = moment.tz.names();
    static lowercaseTimezoneIndex: [number, string][] = TimeZone.timeZones.map((timezone, idx) => [
        idx,
        timezone.toLowerCase(),
    ]);
    static search(input: string) {
        const inputLowerCase = input.toLowerCase();
        const indices = TimeZone.lowercaseTimezoneIndex
            .filter((entry) => entry[1].includes(inputLowerCase))
            .map((result) => result[0]);
        return indices.map((i) => [i, TimeZone.timeZones[i]]);
    }
    static formatISODate(date: Date, timezone: string): string {
        try {
            const dt = luxon.DateTime.fromJSDate(date, { zone: timezone });
            const iso = dt.toISO();
            if (!iso) {
                return luxon.DateTime.fromJSDate(date, { zone: "UTC" }).toISO()?.substring(0, 16) ?? "Invalid Date";
            }
            return iso.substring(0, 16);
        } catch (_e) {
            const fallback = luxon.DateTime.fromJSDate(date, { zone: "UTC" }).toISO();
            return fallback?.substring(0, 16) ?? "Invalid Date";
        }
    }

    static parseISODate(str: string, timezone: string) {
        return luxon.DateTime.fromISO(str, { zone: timezone });
    }
}
