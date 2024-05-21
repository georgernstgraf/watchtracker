const moment = require('moment-timezone');
class TimeZone {
    static timezones = moment.tz.names();
    static timezonesIdxLC = TimeZone.timezones.map((tz, idx) => [
        idx,
        tz.toLowerCase()
    ]);
    static search(inpt) {
        const inptLC = inpt.toLowerCase();
        const idxes = TimeZone.timezonesIdxLC
            .filter((arr) => arr[1].includes(inptLC))
            .map((a) => a[0]);
        return idxes.map((i) => [i, TimeZone.timezones[i]]);
    }
}
module.exports = TimeZone;
