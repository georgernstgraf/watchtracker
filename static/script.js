// Initialize theme on page load
(function() {
    const theme = localStorage.getItem('watchtracker-theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', theme);
    // Set initial icon
    document.addEventListener('DOMContentLoaded', function() {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    });
})();

htmx.config.logAll = true;
// login if a 401 occurs
document
    .querySelector('body')
    .addEventListener('htmx:responseError', (event) => {
        if (event.detail.xhr.status === 401) {
            htmx.ajax('GET', '/watchtracker/');
        } else {
            // Swap error HTML into toast and show it
            const messageEl = document.getElementById('errorToastMessage');
            const toastEl = document.getElementById('errorToast');
            if (messageEl && toastEl) {
                messageEl.innerHTML = event.detail.xhr.responseText;
                bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
            }
        }
    });

// Handle I/O errors (network failures, timeouts, etc.)
document
    .querySelector('body')
    .addEventListener('htmx:sendError', (event) => {
        const messageEl = document.getElementById('errorToastMessage');
        const toastEl = document.getElementById('errorToast');
        if (messageEl && toastEl) {
            messageEl.textContent = 'Network error: ' + (event.detail.errorMessage || 'Connection failed');
            bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
        }
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
    const create$ = document.getElementById('measurementCreateForm');
    const dtInput$ = document.getElementById('measurementCreateDateTime');
    dtInput$.value = getCurrentDateTime();
    create$.style.display = '';
    create$.querySelector('input[type="number"]').focus();

}
function hideMeasurementCreate() {
    const create$ = document.getElementById('measurementCreateForm');
    create$.style.display = 'none';
}
function toggleEditMode(eltId, on = false) {
    const edit$ = document.getElementById(`${eltId}-edit`);
    const show$ = document.getElementById(`${eltId}-show`);
    if (on) {
        show$.style.display = "none";
        edit$.style.display = "";
        edit$.querySelector('input[type="number"]').focus();
    } else {
        edit$.style.display = "none";
        show$.style.display = "";
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('watchtracker-theme', newTheme);
    // Update icon
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
}
