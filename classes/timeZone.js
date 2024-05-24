const moment = require('moment-timezone');
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
}
module.exports = TimeZone;
