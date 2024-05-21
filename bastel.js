const TimeZone = require('./classes/timeZone');
const luxon = require('luxon');
const repl = require('repl');
const replObj = repl.start();
const context = replObj.context;
// createdAt: luxon.DateTime.fromISO(tStr, { zone })
context.tz = TimeZone;
context.d = new Date();
context.tz1 = 'Europe/Vienna';
context.tz2 = 'UTC';
context.tz3 = 'TUC';
context.f = 'YYYY-MM-DDTHH:mm';
context.luxon = luxon;
context.s = '2024-05-18T09:42';
