htmx.config.logAll = true;
// login if a 401 occurs
document
    .querySelector('body')
    .addEventListener('htmx:responseError', (event) => {
        if (event.detail.xhr.status === 401) {
            // Trigger an htmx request on otherDiv
            htmx.ajax('GET', '/watchtracker/'); // TODO FIXME
        }
    });
document.querySelector('body').addEventListener('keyup', (event) => {
    if (event.key == 'Escape') htmx.ajax('GET', '/watchtracker/'); // TODO FIXME
});
function getCurrentDateTime() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return formattedDateTime = now.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minute;
}
function showMeasurementCreate() {
    const create$ = document.getElementById('measureCreate');
    const dtInput$ = document.getElementById('measureCreateDateTime');
    dtInput$.value = getCurrentDateTime();
    create$.style.display = '';
}
function hideMeasurementCreate() {
    const create$ = document.getElementById('measureCreate');
    create$.style.display = 'none';
}
function editMode(eltId, on = false) {
    const edit$ = document.getElementById(`${eltId}-edit`);
    const show$ = document.getElementById(`${eltId}-show`);
    if (on) {
        edit$.style.display = "";
        show$.style.display = "none";
    } else {
        edit$.style.display = "none";
        show$.style.display = "";
    }
}
function captionStyle(style) {
    const normal$ = document.getElementById("caption-normal");
    const edit$ = document.getElementById("caption-edit");
    switch (style) {
        case "normal": {
            normal$.style.display = "";
            edit$.style.display = "none";
            break;
        }
        case "edit": {
            normal$.style.display = "none";
            edit$.style.display = "";
            break;
        }
        default: {
            throw new Error("this caption Style not implemented");
        }
    }
}
function watchCreateDisplay(what) {
    const btn$ = document.getElementById('watchCreateBtn');
    const form$ = document.getElementById('watchCreateForm');
    switch (what) {
        case "form": {
            btn$.style.display = "none";
            form$.style.display = "";
            break;
        }
        case "btn": {
            btn$.style.display = "";
            form$.style.display = "none";
        }
        default: {
            throw new Error("not implemented");
        }
    }
}
function editTimezone(really = true) {
    const edit$ = document.getElementById('timeZoneEdit');
    const disp$ = document.getElementById('timeZoneDisplay');
    switch (really) {
        case true: {
            edit$.style.display = "";
            disp$.style.display = "none";
            break;
        }
        case false: {
            edit$.style.display = "none";
            disp$.style.display = "";
            break;
        }
        default: {
            throw new Error("not implemented");
        }
    }
}