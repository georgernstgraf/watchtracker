// const htmx = window.htmx;
// htmx.on('htmx:load', function (event) {
//     console.log('HTMX:LOAD!!!!!!!!');
// });
// htmx.on('htmx:onLoadError', function (event) {
//     console.log('HTMX:ONLOADERROR!!!!!!!!');
//     console.log(event);
// });
// const loginForm = document.getElementById('loginForm');
// htmx.on('htmx:responseError', function (event) {
//     console.log('HTMX:RESPONSEERROR!!!!!!!!');
//     if (event.detail.xhr.status === 401) {
//         loginForm.showModal();
//     }
//     console.log(event);
//     // event.detail.xhr.response (html response)
//     //
// });
// loginForm.addEventListener('htmx:afterOnLoad', function (event) {
//     if (event.detail.xhr.status === 200) {
//         loginForm.close();
//     }
// });
