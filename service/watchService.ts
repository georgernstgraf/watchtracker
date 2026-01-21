import { WatchRepository } from "../repo/watchRepository.ts";
import { MeasurementRepository } from "../repo/measurementRepository.ts";
import { UserRepository } from "../repo/userRepository.ts";
import { UserService } from "./userService.ts";
import { MeasurementService } from "./measurementService.ts";
import { TimeZone } from "../lib/timeZone.ts";
import type { Measurement, Prisma, Watch } from "generated-prisma-client";

export class WatchService {
    /**
     * Create a new watch for a user
     */
    static async createWatch(watchData: Prisma.WatchCreateInput): Promise<Watch> {
        return await WatchRepository.create(watchData);
    }

    /**
     * Find watch by ID
     */
    static async findWatchById(id: string): Promise<Watch | null> {
        return await WatchRepository.findUnique({ id });
    }

    /**
     * Get watch with all its measurements and user data
     */
    static async getWatchWithMeasurements(watchId: string): Promise<Watch | null> {
        return await WatchRepository.findWatchWithMeasurements({ id: watchId });
    }

    /**
     * Get user's watch with measurements (either specific watch or last used watch)
     */
    static async getUserWatchWithMeasurements(username: string, watchId?: string): Promise<Watch | null> {
        if (watchId) {
            // Verify the watch belongs to the user
            const watch = await WatchRepository.findUnique({ id: watchId });
            if (!watch || watch.user?.name !== username) {
                return null;
            }
            return await WatchRepository.findWatchWithMeasurements({ id: watchId });
        } else {
            // Get user's last watch
            const user = await UserRepository.findUserWithWatches({ name: username });
            const userWithWatch = user as typeof user & { lastWatch?: { id: string } };
            if (!userWithWatch || !userWithWatch.lastWatch) {
                return null;
            }
            return await WatchRepository.findWatchWithMeasurements({ id: userWithWatch.lastWatch.id });
        }
    }

    /**
     * Get all watches for a user id
     */
    static async getUserWatchesByUid(userId: string): Promise<Watch[]> {
        return await WatchRepository.findByUserId(userId);
    }

    /**
     * Get all watches for a user name
     */
    static async getUserWatchesByUname(username: string): Promise<Watch[]> {
        return await WatchRepository.findByUsername(username);
    }

    /**
     * Find watch by name and user ID
     */
    static async findWatchByNameAndUser(name: string, userId: string): Promise<Watch | null> {
        return await WatchRepository.findByNameAndUserId(name, userId);
    }

    /**
     * Update watch information
     */
    static async updateWatch(watchId: string, updateData: Prisma.WatchUpdateInput): Promise<Watch> {
        return await WatchRepository.update({
            where: { id: watchId },
            data: updateData,
        });
    }

    /**
     * Delete a watch (only if it belongs to the user)
     */
    static async deleteWatch(watchId: string, userId: string): Promise<Watch> {
        // Verify ownership before deletion
        const watch = await WatchRepository.findUnique({ id: watchId });
        if (!watch || watch.userId !== userId) {
            throw new Error("Watch not found or access denied");
        }

        return await WatchRepository.delete({ id: watchId });
    }

    /**
     * Check if watch belongs to user
     */
    static async watchBelongsToUser(watchId: string, username: string): Promise<boolean> {
        const watch = await WatchRepository.findUnique({ id: watchId });
        return watch?.user?.name === username;
    }

    /**
     * Get watch statistics
     */
    static async getWatchStatistics(watchId: string) {
        return await WatchRepository.getWatchStats(watchId);
    }

    /**
     * Get all watches with pagination and filtering
     */
    static async getAllWatches(params?: {
        where?: Prisma.WatchWhereInput;
        orderBy?: Prisma.WatchOrderByWithRelationInput | Prisma.WatchOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Watch[]> {
        return await WatchRepository.findMany(params);
    }

    /**
     * Count watches for a user
     */
    static async countUserWatches(userId: string): Promise<number> {
        return await WatchRepository.count({ userId });
    }

    /**
     * Get or create a watch for a user
     */
    static async getOrCreateWatch(name: string, userId: string, comment?: string): Promise<Watch> {
        const existingWatch = await WatchRepository.findByNameAndUserId(name, userId);
        if (existingWatch) {
            return existingWatch;
        }

        return await WatchRepository.create({
            name,
            comment,
            user: { connect: { id: userId } },
        });
    }

    /**
     * Set watch as user's last used watch
     */
    static async setAsLastWatch(watchId: string, userId: string): Promise<void> {
        // Verify the watch belongs to the user
        const belongsToUser = await this.watchBelongsToUser(watchId, userId);
        if (!belongsToUser) {
            throw new Error("Watch not found or access denied");
        }

        await UserRepository.update({
            where: { id: userId },
            data: {
                lastWatch: { connect: { id: watchId } },
            },
        });
    }

    /**
     * Get running measurements for a watch (measurements that have been started but not stopped)
     */
    static async getRunningMeasurements(watchId: string): Promise<Measurement[]> {
        return await MeasurementRepository.getRunningMeasurements(watchId);
    }

    /**
     * Check if watch exists
     */
    static async watchExists(watchId: string): Promise<boolean> {
        return await WatchRepository.exists({ id: watchId });
    }

    /**
     * Get complete watch data for display with measurements and calculated drifts
     */
    static async getWatchForDisplay(username: string, watchId?: string) {
        const watch = await this.getUserWatchWithMeasurements(username, watchId);
        if (!watch) {
            return null;
        }

        // Get user's timezone for date formatting
        const user = await UserService.getUserByName(username);
        const timeZone = user?.timeZone || "UTC";

        const watchWithMeasurements = watch as typeof watch & {
            measurements?: Measurement[];
        };

        if (watchWithMeasurements.measurements && watchWithMeasurements.measurements.length > 0) {
            // Enrich measurements with createdAt16 and driftDisplay
            const measurementsWithDrifts = watchWithMeasurements.measurements.map((m) => {
                const dateObj = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
                return {
                    ...m,
                    createdAt16: TimeZone.get16(dateObj, timeZone),
                    driftDisplay: "n/a" as string,
                    driftMath: undefined as { durationDays: number; driftSeks: number } | undefined,
                };
            });

            // Apply drift calculations (mutates array to add driftDisplay)
            const overallMeasure = MeasurementService.calculateDrifts(measurementsWithDrifts);

            return {
                ...watchWithMeasurements,
                measurements: measurementsWithDrifts,
                overallMeasure,
            };
        }

        return watchWithMeasurements;
    }
}
