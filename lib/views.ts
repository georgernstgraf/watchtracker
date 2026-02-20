import { render, renderData as baseData } from "./hbs.ts";
import * as types from "./viewtypes.ts";

/**
 * Internal helper to merge base render data (appPath) with template specific data
 */
function merge<T>(data: T): T & types.BaseRenderData {
    return Object.assign({}, baseData, data);
}

type ViewInput<T> = Omit<T, keyof types.BaseRenderData>;

// --- Layouts (full HTML pages for direct browser loads) ---

export function renderPageAuth(data: ViewInput<types.UserWatchData>): string {
    return render<types.UserWatchData>("layouts/page-auth", merge(data));
}

export function renderPageUnauth(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("layouts/page-unauth", merge(data));
}

export function renderPageWatchDetails(data: ViewInput<types.PageWatchDetailsData>): string {
    return render<types.PageWatchDetailsData>("layouts/page-watch-details", merge(data));
}

export function renderPageError(data: ViewInput<types.ErrorData>): string {
    return render<types.ErrorData>("layouts/page-error", merge(data));
}

// --- Fragments (HTMX-swappable pieces rendered by route handlers) ---

export function renderBodyAuth(data: ViewInput<types.UserWatchData>): string {
    return render<types.UserWatchData>("fragments/body-auth", merge(data));
}

export function renderBodyUnauth(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("fragments/body-unauth", merge(data));
}

export function renderWatchList(data: ViewInput<types.WatchListData>): string {
    return render<types.WatchListData>("fragments/watch-list", merge(data));
}

export function renderWatchGrid(data: ViewInput<types.WatchGridData>): string {
    return render<types.WatchGridData>("fragments/watch-grid", merge(data));
}

export function renderWatchDetails(data: ViewInput<types.WatchDetailsViewData>): string {
    return render<types.WatchDetailsViewData>("fragments/watch-details", merge(data));
}

export function renderMeasurements(data: ViewInput<types.MeasurementsViewData>): string {
    return render<types.MeasurementsViewData>("fragments/measurements", merge(data));
}

export function renderLoginContent(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("fragments/login-content", merge(data));
}

export function renderError(data: ViewInput<types.ErrorData>): string {
    return render<types.ErrorData>("fragments/error", merge(data));
}

// --- Partials (rendered directly only by specific routes) ---

export function renderTimezoneSelector(data: ViewInput<types.TimezoneSelectorData>): string {
    return render<types.TimezoneSelectorData>("partials/timezone-selector", merge(data));
}
