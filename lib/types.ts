import type { SessionData } from "../middleware/session.ts";
import type { Context } from "hono";

declare module "hono" {
    interface ContextVariableMap {
        session: SessionData & {
            destroy: () => Promise<void>;
            save: () => Promise<void>;
        };
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
