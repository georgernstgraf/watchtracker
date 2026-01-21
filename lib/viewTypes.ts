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
