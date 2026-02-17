htmx.config.logAll = true;
// login if a 401 occurs
document
    .querySelector("body")
    .addEventListener("htmx:responseError", (event) => {
        if (event.detail.xhr.status === 401) {
            htmx.ajax("GET", "/watchtracker");
        } else {
            // Swap error HTML into toast and show it
            const messageEl = document.getElementById("errorToastMessage");
            const toastEl = document.getElementById("errorToast");
            if (messageEl && toastEl) {
                messageEl.innerHTML = event.detail.xhr.responseText;
                bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
            }
        }
    });

// Handle I/O errors (network failures, timeouts, etc.)
document
    .querySelector("body")
    .addEventListener("htmx:sendError", (event) => {
        const messageEl = document.getElementById("errorToastMessage");
        const toastEl = document.getElementById("errorToast");
        if (messageEl && toastEl) {
            messageEl.textContent = "Network error: " + (event.detail.errorMessage || "Connection failed");
            bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
        }
    });
