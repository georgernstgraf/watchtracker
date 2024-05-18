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
