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
    const create$ = document.getElementById("caption-create");
    const edit$ = document.getElementById("caption-edit");
    switch (style) {
        case "normal": {
            normal$.style.display = "";
            create$.style.display = "none";
            edit$.style.display = "none";
            break;
        }
        case "create": {
            normal$.style.display = "none";
            create$.style.display = "";
            edit$.style.display = "none";
            break;
        }
        case "edit": {
            normal$.style.display = "none";
            create$.style.display = "none";
            edit$.style.display = "";
            break;
        }
        default: {
            throw new Error("this caption Style not implemented");
        }
    }
}
