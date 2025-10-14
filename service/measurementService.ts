import { MeasurementRepository } from "../repo/measurementRepository.ts";
import { WatchRepository } from "../repo/watchRepository.ts";
import type { Measurement, Prisma } from "generated-prisma-client";

export class MeasurementService {
    /**
     * Create a new measurement
     */
    static async createMeasurement(measurementData: Prisma.MeasurementCreateInput): Promise<Measurement> {
        return await MeasurementRepository.create(measurementData);
    }

    /**
     * Find measurement by ID
     */
    static async findMeasurementById(id: string): Promise<Measurement | null> {
        return await MeasurementRepository.findUnique({ id });
    }

    /**
     * Get measurement with watch and user information
     */
    static async getMeasurementWithWatch(id: string): Promise<Measurement | null> {
        return await MeasurementRepository.findMeasurementWithWatch({ id });
    }

    /**
     * Get user's measurement (also ensures user owns the measurement)
     */
    static async getUserMeasurement(username: string, measurementId: string): Promise<Measurement | null> {
        const measurement = await MeasurementRepository.findMeasurementWithWatch({ id: measurementId });
        const measurementWithWatch = measurement as typeof measurement & {
            watch?: { id: string; user: { name: string } };
        };
        if (!measurementWithWatch || !measurementWithWatch.watch || measurementWithWatch.watch.user.name !== username) {
            return null;
        }
        return measurementWithWatch;
    }

    /**
     * Get all measurements for a specific watch
     */
    static async getWatchMeasurements(watchId: string, params?: {
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Measurement[]> {
        return await MeasurementRepository.findByWatchId(watchId, params);
    }

    /**
     * Get latest measurement for a watch
     */
    static async getLatestMeasurement(watchId: string): Promise<Measurement | null> {
        return await MeasurementRepository.findLatestByWatchId(watchId);
    }

    /**
     * Get measurements within a date range
     */
    static async getMeasurementsByDateRange(params: {
        watchId?: string;
        startDate: Date;
        endDate: Date;
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
    }): Promise<Measurement[]> {
        return await MeasurementRepository.findByDateRange(params);
    }

    /**
     * Update a measurement
     */
    static async updateMeasurement(measurementId: string, updateData: Prisma.MeasurementUpdateInput): Promise<Measurement> {
        return await MeasurementRepository.update({
            where: { id: measurementId },
            data: updateData,
        });
    }

    /**
     * Delete a measurement
     */
    static async deleteMeasurement(measurementId: string): Promise<Measurement> {
        return await MeasurementRepository.delete({ id: measurementId });
    }

    /**
     * Delete a user's measurement (ensures user owns the measurement)
     */
    static async deleteUserMeasurement(username: string, measurementId: string): Promise<Measurement | null> {
        const measurement = await this.getUserMeasurement(username, measurementId);
        if (!measurement) {
            return null;
        }
        return await MeasurementRepository.delete({ id: measurementId });
    }

    /**
     * Create a measurement for a user's watch
     */
    static async createMeasurementForWatch(
        userId: string,
        watchId: string,
        measurementData: {
            value: number;
            isStart: boolean;
            comment?: string;
            createdAt?: Date;
        },
    ): Promise<Measurement | null> {
        // Verify the watch belongs to the user
        const watch = await WatchRepository.findUnique({ id: watchId });
        if (!watch || watch.userId !== userId) {
            return null;
        }

        return await MeasurementRepository.create({
            value: measurementData.value,
            isStart: measurementData.isStart,
            comment: measurementData.comment,
            createdAt: measurementData.createdAt,
            watch: { connect: { id: watchId } },
        });
    }

    /**
     * Get measurement statistics for a watch
     */
    static async getMeasurementStatistics(watchId: string) {
        return await MeasurementRepository.getMeasurementStats(watchId);
    }

    /**
     * Get running measurements (start measurements without corresponding stop)
     */
    static async getRunningMeasurements(watchId: string): Promise<Measurement[]> {
        return await MeasurementRepository.getRunningMeasurements(watchId);
    }

    /**
     * Check if a watch has any running measurements
     */
    static async hasRunningMeasurements(watchId: string): Promise<boolean> {
        const runningMeasurements = await MeasurementRepository.getRunningMeasurements(watchId);
        return runningMeasurements.length > 0;
    }

    /**
     * Start timing for a watch
     */
    static async startTiming(userId: string, watchId: string, value: number, comment?: string): Promise<Measurement | null> {
        return await this.createMeasurementForWatch(userId, watchId, {
            value,
            isStart: true,
            comment,
        });
    }

    /**
     * Stop timing for a watch
     */
    static async stopTiming(userId: string, watchId: string, value: number, comment?: string): Promise<Measurement | null> {
        return await this.createMeasurementForWatch(userId, watchId, {
            value,
            isStart: false,
            comment,
        });
    }

    /**
     * Get all measurements with pagination and filtering
     */
    static async getAllMeasurements(params?: {
        where?: Prisma.MeasurementWhereInput;
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Measurement[]> {
        return await MeasurementRepository.findMany(params);
    }

    /**
     * Count measurements for a watch
     */
    static async countWatchMeasurements(watchId: string): Promise<number> {
        return await MeasurementRepository.count({ watchId });
    }

    /**
     * Check if measurement exists
     */
    static async measurementExists(measurementId: string): Promise<boolean> {
        return await MeasurementRepository.exists({ id: measurementId });
    }

    /**
     * Get watch ID for a measurement owned by a user
     */
    static async getWatchIdForUserMeasurement(userId: string, measurementId: string): Promise<string | null> {
        const measurement = await this.getUserMeasurement(userId, measurementId);
        const measurementWithWatch = measurement as typeof measurement & {
            watch?: { id: string };
        };
        return measurementWithWatch?.watch?.id || null;
    }

    /**
     * Calculate drifts for measurements (business logic for watch accuracy)
     */
    static calculateDrifts(measurements: Measurement[]): typeof measurements[0] & { overallMeasure?: unknown } | undefined {
        if (!measurements || measurements.length === 0) return undefined;

        // Sort measurements by creation date (newest first)
        const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // The last (oldest) measurement is always START
        const lastMeasurement = sortedMeasurements[sortedMeasurements.length - 1] as typeof sortedMeasurements[0] & {
            driftDisplay?: string;
        };
        lastMeasurement.isStart = true;
        lastMeasurement.driftDisplay = "n/a";

        // Calculate drifts for other measurements
        for (let i = sortedMeasurements.length - 2; i >= 0; i--) {
            const current = sortedMeasurements[i] as typeof sortedMeasurements[0] & {
                driftDisplay?: string;
            };
            const previous = sortedMeasurements[i + 1];

            if (current.isStart) {
                current.driftDisplay = "n/a";
                continue;
            }

            const durationMS = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
            const driftSecs = current.value - previous.value;
            const durationDays = durationMS / (24 * 60 * 60 * 1000); // ms to days

            if (durationDays > 0) {
                const driftPerDay = driftSecs / durationDays;
                current.driftDisplay = `${driftPerDay.toFixed(1)}s/day`;
            } else {
                current.driftDisplay = "n/a";
            }
        }

        return lastMeasurement;
    }
}
