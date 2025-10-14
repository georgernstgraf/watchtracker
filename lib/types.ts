import type { User, Watch } from "generated-prisma-client";

export type renderData = {
    user?: User;
    errors?: string[];
    userWatches?: Watch[];
    timeZones?: string[];
    watch?: Watch | null;
    appPath: string;
};
