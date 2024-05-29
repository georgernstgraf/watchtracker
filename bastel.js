const TimeZone = require('./classes/timeZone');
const luxon = require('luxon');
const repl = require('repl');

var now = new Date();
var month = (now.getMonth() + 1).toString().padStart(2, '0');
var day = now.getDate().toString().padStart(2, '0');
var hour = now.getHours().toString().padStart(2, '0');
var minute = now.getMinutes().toString().padStart(2, '0');
var formattedDateTime = now.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minute;

const replObj = repl.start();
Object.assign(replObj.context, { luxon, TimeZone, formattedDateTime });
