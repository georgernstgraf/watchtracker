const luxon = require('luxon');
const moment = require('moment-timezone');
const prisma = require('./lib/db');
const assert = require('assert');
async function main() {
    const mId = 'clwcdvbud000111lerkktj40y';
    const tStr = '2024-06-18T09:42';
    const zone = 'Europe/Moscow';
    assert(moment.tz.names().some((z) => z == zone));
    console.log(`${tStr} for ${zone}`);
    await prisma.measurement.update({
        where: { id: mId },
        data: {
            createdAt: luxon.DateTime.fromISO(tStr, { zone })
        }
    });
    console.log('done');
}
main();
