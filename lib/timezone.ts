import moment from "moment-timezone";

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
}
