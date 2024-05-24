const TimeZone = require('./classes/timeZone');
const luxon = require('luxon');
const repl = require('repl');
const d = '2024-05-24T19:29';

const replObj = repl.start();
Object.assign(replObj.context, { luxon, TimeZone, d });
