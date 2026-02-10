import type { User, Watch, Measurement } from "generated-prisma-client";

export interface EnrichedMeasurement extends Measurement {
    createdAt16: string;
    driftDisplay: string;
    driftMath?: { durationDays: number; driftSeks: number };
}

export interface EnrichedWatch extends Watch {
    measurements: EnrichedMeasurement[];
    overallMeasure?: {
        durationDays: string;
        driftSeks: number;
        niceDisplay: string;
    };
}

export interface WatchCard extends Watch {
    precision?: string;
    daysMeasured?: string;
    lastUsed?: string;
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
    user: User;
    timeZones: string[];
    userWatches: Watch[];
    watch: EnrichedWatch | null;
}

export interface MeasurementsViewData extends BaseRenderData {
    watch: EnrichedWatch;
}

export interface CaptionViewData extends BaseRenderData {
    watch: EnrichedWatch | null;
}

export interface AllButHeadAndFootData extends BaseRenderData {
    userWatches: Watch[];
    watch: EnrichedWatch | null;
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
    user: User;
    timeZones: string[];
}

// UserWatchesData - for userwatches.hbs
export interface UserWatchesData extends BaseRenderData {
    userWatches: WatchCard[];
    sortBy?: string;
}

// WatchDetailsViewData - for watch-details.hbs
export interface WatchDetailsViewData extends BaseRenderData {
    watch: EnrichedWatch;
    userWatches: Watch[];
}
