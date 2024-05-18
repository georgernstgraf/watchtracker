const moment = require('moment-timezone');
const l = require('luxon');
const repl = require('repl');
const r = repl.start();
const c = r.context;
// createdAt: luxon.DateTime.fromISO(tStr, { zone })
c.moment = moment;
c.d = new Date();
c.tz1 = 'Europe/Vienna';
c.tz2 = 'UTC';
c.tz3 = 'TUC';
c.f = 'YYYY-MM-DDTHH:mm';
c.l = l;
c.s = '2024-05-18T09:42';
