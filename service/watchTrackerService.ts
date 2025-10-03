import { UserService } from "./userService.ts";
import { WatchService } from "./watchService.ts";
import { MeasurementService } from "./measurementService.ts";
import type { Measurement } from "generated-prisma-client";

/**
 * High-level service that orchestrates operations across multiple entities
 */
export class WatchTrackerService {
    /**
     * Complete workflow: Create user if needed, create/get watch, and add measurement
     */
    static async recordMeasurement(params: {
        userName: string;
        watchName: string;
        value: number;
        isStart: boolean;
        comment?: string;
        watchComment?: string;
    }): Promise<
        {
            measurement: Measurement;
            watchId: string;
            userId: string;
        } | null
    > {
        // Ensure user exists
        const user = await UserService.enforceUserExists(params.userName);

        // Get or create the watch
        const watch = await WatchService.getOrCreateWatch(
            params.watchName,
            user.id,
            params.watchComment,
        );

        // Set as last used watch
        await WatchService.setAsLastWatch(watch.id, user.id);

        // Create the measurement
        const measurement = await MeasurementService.createMeasurementForWatch(
            user.id,
            watch.id,
            {
                value: params.value,
                isStart: params.isStart,
                comment: params.comment,
            },
        );

        if (!measurement) {
            return null;
        }

        return {
            measurement,
            watchId: watch.id,
            userId: user.id,
        };
    }

    /**
     * Get complete watch data for display with measurements and calculated drifts
     */
    static async getWatchForDisplay(userId: string, watchId?: string) {
        const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);
        if (!watch) {
            return null;
        }

        const watchWithMeasurements = watch as typeof watch & {
            measurements?: Measurement[];
        };

        if (watchWithMeasurements.measurements) {
            // Calculate drifts for display
            const measurementsWithDrifts = watchWithMeasurements.measurements.map((m) => ({
                ...m,
                driftDisplay: "n/a" as string | undefined,
            }));

            // Apply drift calculations
            MeasurementService.calculateDrifts(measurementsWithDrifts);

            return {
                ...watchWithMeasurements,
                measurements: measurementsWithDrifts,
                overallMeasure: MeasurementService.calculateDrifts(measurementsWithDrifts),
            };
        }

        return watchWithMeasurements;
    }

    /**
     * Get user's dashboard data: user info, watches, and recent measurements
     */
    static async getUserDashboard(userId: string) {
        const [user, watches, userWithWatches] = await Promise.all([
            UserService.findUserById(userId),
            WatchService.getUserWatches(userId),
            UserService.getUserWithWatches(userId),
        ]);

        if (!user) {
            return null;
        }

        // Get recent measurements for each watch
        const watchesWithRecentMeasurements = await Promise.all(
            watches.map(async (watch) => {
                const recentMeasurements = await MeasurementService.getWatchMeasurements(
                    watch.id,
                    { orderBy: { createdAt: "desc" }, take: 5 },
                );
                const stats = await MeasurementService.getMeasurementStatistics(watch.id);

                return {
                    ...watch,
                    recentMeasurements,
                    stats,
                };
            }),
        );

        const userWithLastWatch = userWithWatches as typeof userWithWatches & {
            lastWatch?: { id: string; name: string };
        };

        return {
            user,
            watches: watchesWithRecentMeasurements,
            lastWatch: userWithLastWatch?.lastWatch,
        };
    }

    /**
     * Delete a watch and all its measurements
     */
    static async deleteWatchCompletely(userId: string, watchId: string): Promise<boolean> {
        try {
            // Verify ownership
            const belongsToUser = await WatchService.watchBelongsToUser(watchId, userId);
            if (!belongsToUser) {
                return false;
            }

            // Delete all measurements first (cascade should handle this, but being explicit)
            await MeasurementService.getAllMeasurements({
                where: { watchId },
            }).then((measurements) => Promise.all(measurements.map((m) => MeasurementService.deleteMeasurement(m.id))));

            // Delete the watch
            await WatchService.deleteWatch(watchId, userId);

            return true;
        } catch (error) {
            console.error("Error deleting watch:", error);
            return false;
        }
    }

    /**
     * Get watch statistics with additional calculated data
     */
    static async getWatchAnalytics(userId: string, watchId: string) {
        const belongsToUser = await WatchService.watchBelongsToUser(watchId, userId);
        if (!belongsToUser) {
            return null;
        }

        const [watch, measurements, stats, runningMeasurements] = await Promise.all([
            WatchService.findWatchById(watchId),
            MeasurementService.getWatchMeasurements(watchId, {
                orderBy: { createdAt: "asc" },
            }),
            MeasurementService.getMeasurementStatistics(watchId),
            MeasurementService.getRunningMeasurements(watchId),
        ]);

        if (!watch) {
            return null;
        }

        // Calculate additional analytics
        const totalDuration = measurements.length > 1
            ? new Date(measurements[measurements.length - 1].createdAt).getTime() -
                new Date(measurements[0].createdAt).getTime()
            : 0;

        const averageInterval = measurements.length > 1 ? totalDuration / (measurements.length - 1) : 0;

        return {
            watch,
            stats,
            totalMeasurements: measurements.length,
            runningMeasurements: runningMeasurements.length,
            totalDurationDays: totalDuration / (24 * 60 * 60 * 1000),
            averageIntervalDays: averageInterval / (24 * 60 * 60 * 1000),
            firstMeasurement: measurements[0] || null,
            lastMeasurement: measurements[measurements.length - 1] || null,
        };
    }
}
