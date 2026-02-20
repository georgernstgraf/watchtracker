import type { User, Watch, Measurement } from "generated-prisma-client";

export interface UserDataForViews {
    name: string;
    timeZone: string;
}

export function toUserDataForViews(user: User): UserDataForViews {
    return { name: user.name, timeZone: user.timeZone };
}

export interface EnrichedMeasurement extends Measurement {
    driftDisplay: string;
}

export interface MeasurementPeriod {
    measurements: EnrichedMeasurement[];
    firstDate: Date;
    lastDate: Date;
    periodDrift: string;
}

export interface EnrichedWatch extends Watch {
    measurements: EnrichedMeasurement[];
    periods: MeasurementPeriod[];
    overallMeasure?: {
        durationDays: string;
        driftSeconds: number;
        niceDisplay: string;
    };
}

export interface WatchCard extends Watch {
    precision?: string;
    daysMeasured?: string;
    lastUsedDate?: Date;
}

export interface BaseRenderData {
    appPath: string;
}

export interface ErrorData extends BaseRenderData {
    error: {
        message: string;
        stack?: string;
        path?: string;
    };
    errors?: string[];
}

export interface LoginData extends BaseRenderData {
    errors?: string[];
}

export interface UserWatchData extends BaseRenderData {
    user: UserDataForViews;
    timeZones: string[];
}

export interface MeasurementsViewData extends BaseRenderData {
    watch: EnrichedWatch;
    userTimeZone: string;
}

// WatchListData - for fragments/watch-list.hbs
export interface WatchListData extends BaseRenderData {
}

// TimezoneSelectorData - for partials/timezone-selector.hbs
export interface TimezoneSelectorData extends BaseRenderData {
    user: UserDataForViews;
    timeZones: string[];
}

// WatchGridData - for fragments/watch-grid.hbs
export interface WatchGridData extends BaseRenderData {
    userWatches: WatchCard[];
    userTimeZone: string;
}

// WatchDetailsViewData - for fragments/watch-details.hbs
export interface WatchDetailsViewData extends BaseRenderData {
    watch: EnrichedWatch;
    userTimeZone: string;
}

// PageWatchDetailsData - for layouts/page-watch-details.hbs (full-page, direct browser load)
export interface PageWatchDetailsData extends BaseRenderData {
    watch: EnrichedWatch;
    userTimeZone: string;
    user: UserDataForViews;
    timeZones: string[];
}
