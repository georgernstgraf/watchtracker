const moment = require('moment-timezone');
const luxon = require('luxon');

class TimeZone {
    static timeZones = moment.tz.names();
    static timeZonesIdxLC = TimeZone.timeZones.map((tz, idx) => [
        idx,
        tz.toLowerCase()
    ]);
    static search(inpt) {
        const inptLC = inpt.toLowerCase();
        const idxes = TimeZone.timeZonesIdxLC
            .filter((arr) => arr[1].includes(inptLC))
            .map((a) => a[0]);
        return idxes.map((i) => [i, TimeZone.timeZones[i]]);
    }
    static get16(date, tz) {
        return luxon.DateTime.fromJSDate(date, { zone: tz }).toISO().substring(0, 16);
    }
    static from16(str, tz) {
        return luxon.DateTime.fromISO(str, { zone: tz });
    }
}
module.exports = TimeZone;
