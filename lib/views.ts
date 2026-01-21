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

export function renderLoginBody(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("login-body", merge(data));
}

export function renderLoginFull(data: ViewInput<types.LoginData>): string {
    return render<types.LoginData>("login-full", merge(data));
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

export function renderCaption(data: ViewInput<types.CaptionViewData>): string {
    return render<types.CaptionViewData>("caption", merge(data));
}

export function renderAllButHeadAndFoot(data: ViewInput<types.AllButHeadAndFootData>): string {
    return render<types.AllButHeadAndFootData>("allButHeadAndFoot", merge(data));
}

export function renderBodyAuth(data: ViewInput<types.UserWatchData>): string {
    return render<types.UserWatchData>("body-auth", merge(data));
}
