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
    const normal = document.getElementById("caption-normal");
    const create = document.getElementById("caption-create");
    const edit = document.getElementById("caption-edit");
    switch (style) {
        case "normal": {
            break;
        }
        case "create": {
            break;
        }
        case "edit": {
            break;
        }
        default: {
            throw new Error("this caption Style not implemented");
        }
    }
}
