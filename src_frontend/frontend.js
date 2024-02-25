window.htmx = require('htmx.org');
const htmx = window.htmx;
htmx.on('htmx:load', function (event) {
    console.log('HX ON!!!!!!!!');
});
