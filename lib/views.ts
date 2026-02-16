import { render, renderData as baseData } from "./hbs.ts";
import * as types from "./viewTypes.ts";

/**
 * Internal helper to merge base render data (appPath) with template specific data
 */
function merge<T>(data: T): T & types.BaseRenderData {
    return Object.assign({}, baseData, data);
}

type ViewInput<T> = Omit<T, keyof types.BaseRenderData>;

export function renderError(data: ViewInput<types.ErrorData>): string {
    return render<types.ErrorData>("error", merge(data));
}

export function renderErrorFull(data: ViewInput<types.ErrorData>): string {
    return render<types.ErrorData>("error-full", merge(data));
}

export function renderLoginContent(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("login-content", merge(data));
}

export function renderBodyUnauth(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("body-unauth", merge(data));
}

export function renderUnauthFull(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("unauth-full", merge(data));
}

export function renderIndexFull(data: ViewInput<types.UserWatchData>): string {
    return render<types.UserWatchData>("index-full", merge(data));
}

export function renderIndexBody(data: ViewInput<types.UserWatchData>): string {
    // This template is actually "body-auth" for HTMX requests to the main page
    return render<types.UserWatchData>("body-auth", merge(data));
}

export function renderMeasurements(data: ViewInput<types.MeasurementsViewData>): string {
    return render<types.MeasurementsViewData>("measurements", merge(data));
}

export function renderAllButHeadAndFoot(data: ViewInput<types.AllButHeadAndFootData>): string {
    return render<types.AllButHeadAndFootData>("allButHeadAndFoot", merge(data));
}

export function renderBodyAuth(data: ViewInput<types.UserWatchData>): string {
    return render<types.UserWatchData>("body-auth", merge(data));
}

export function renderHead(data: ViewInput<types.HeadData>): string {
    return render<types.HeadData>("head", merge(data));
}

export function renderFooter(data: ViewInput<types.FooterData>): string {
    return render<types.FooterData>("footer", merge(data));
}

export function renderMainHeading(data: ViewInput<types.MainHeadingData>): string {
    return render<types.MainHeadingData>("mainHeading", merge(data));
}

export function renderNavProfile(data: ViewInput<types.NavProfileData>): string {
    return render<types.NavProfileData>("navProfile", merge(data));
}

export function renderUserWatches(data?: ViewInput<types.UserWatchesData>): string {
    return render<types.UserWatchesData>("userwatches", merge(data || {}));
}

export function renderWatchGrid(data: ViewInput<types.WatchGridData>): string {
    return render<types.WatchGridData>("watchgrid", merge(data));
}

export function renderWatchDetails(data: ViewInput<types.WatchDetailsViewData>): string {
    return render<types.WatchDetailsViewData>("watch-details", merge(data));
}
