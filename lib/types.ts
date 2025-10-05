import type { Context } from "hono";

// Session interface matching our Session class
export interface SessionInterface {
    user?: {
        id: string;
        name: string;
        timeZone?: string;
        lastWatchId?: string;
    };
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    deleteSession(): void;
    save(): Promise<void>;
    getId(): string;
}

declare module "hono" {
    interface ContextVariableMap {
        session: SessionInterface;
        appPath: string;
        user?: {
            id: string;
            name: string;
            timeZone?: string;
            lastWatchId?: string;
        };
        watch?: Record<string, unknown> | null;
        userWatches?: Record<string, unknown>[] | null;
        timeZones?: string[];
        edit?: boolean;
        errors?: string[];
        render: (templateName: string, data?: Record<string, unknown>) => Response;
    }
}

export type HonoContext = Context;
