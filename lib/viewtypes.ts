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

export interface AllButHeadAndFootData extends BaseRenderData {
}

// HeadData - for head.hbs (HTML head section)
export interface HeadData extends BaseRenderData {
    // Only needs appPath from BaseRenderData
}

// FooterData - for footer.hbs
export interface FooterData extends BaseRenderData {
    // Only needs appPath from BaseRenderData
}

// MainHeadingData - for mainHeading.hbs
export interface MainHeadingData extends BaseRenderData {
    // Only needs appPath from BaseRenderData
}

// NavProfileData - for navProfile.hbs
export interface NavProfileData extends BaseRenderData {
    user: UserDataForViews;
    timeZones: string[];
}

// TimezoneSelectorData - for timezone-selector.hbs
export interface TimezoneSelectorData extends BaseRenderData {
    user: UserDataForViews;
    timeZones: string[];
}

// UserWatchesData - for userwatches.hbs (shell only)
export interface UserWatchesData extends BaseRenderData {
    // No data needed - grid is loaded via HTMX
}

// WatchGridData - for watchgrid.hbs
export interface WatchGridData extends BaseRenderData {
    userWatches: WatchCard[];
    userTimeZone: string;
}

// WatchDetailsViewData - for watch-details.hbs
export interface WatchDetailsViewData extends BaseRenderData {
    watch: EnrichedWatch;
    userTimeZone: string;
}
