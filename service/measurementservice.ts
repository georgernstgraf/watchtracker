import { MeasurementRepository } from "../repo/measurementrepository.ts";
import { WatchRepository } from "../repo/watchrepository.ts";
import type { Measurement, Prisma } from "generated-prisma-client";
import type { EnrichedMeasurement, MeasurementPeriod } from "../lib/viewtypes.ts";

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
        username: string,
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
        if (!watch || watch.user?.name !== username) {
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
    static async startTiming(username: string, watchId: string, value: number, comment?: string): Promise<Measurement | null> {
        return await this.createMeasurementForWatch(username, watchId, {
            value,
            isStart: true,
            comment,
        });
    }

    /**
     * Stop timing for a watch
     */
    static async stopTiming(username: string, watchId: string, value: number, comment?: string): Promise<Measurement | null> {
        return await this.createMeasurementForWatch(username, watchId, {
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
     * Mutates the measurements array to add driftDisplay property
     * Returns overallMeasure object with summary statistics
     */
    static calculateDrifts(measurements: (Measurement & { driftDisplay?: string; driftMath?: { durationDays: number; driftSeconds: number } })[]): {
        durationDays: string;
        driftSeconds: number;
        niceDisplay: string;
    } | undefined {
        if (!measurements || measurements.length === 0) return undefined;

        // Sort measurements by creation date (newest first)
        const sortedMeasurements = [...measurements].sort((measurementA, measurementB) => new Date(measurementB.createdAt).getTime() - new Date(measurementA.createdAt).getTime());

        // The last (oldest) measurement is always START
        const lastMeasurement = sortedMeasurements[sortedMeasurements.length - 1];
        lastMeasurement.isStart = true;
        lastMeasurement.driftDisplay = "n/a";

        // Calculate drifts for other measurements
        for (let i = sortedMeasurements.length - 2; i >= 0; i--) {
            const current = sortedMeasurements[i];
            const previous = sortedMeasurements[i + 1];

            if (current.isStart) {
                current.driftDisplay = "n/a";
                continue;
            }

            const durationMS = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
            const driftSeconds = current.value - previous.value;
            const durationDays = durationMS / (24 * 60 * 60 * 1000); // ms to days

            if (durationDays > 0) {
                const driftPerDay = driftSeconds / durationDays;
                const driftPerDayDisplay = driftPerDay >= 0 ? `+${driftPerDay.toFixed(1)}` : `${driftPerDay.toFixed(1)}`;
                const durationHours = Math.round(durationMS / (60 * 60 * 1000));
                const durationDisplay = durationHours < 72 ? `${durationHours}h` : `${Math.round(durationHours / 24)}d`;
                current.driftDisplay = `${driftPerDayDisplay} s/d (${durationDisplay})`;
                current.driftMath = { durationDays, driftSeconds };
            } else {
                current.driftDisplay = "n/a";
            }
        }

        // Calculate overall measure from all driftMath entries
        const driftCalculations = sortedMeasurements
            .map((measurement) => measurement.driftMath)
            .filter((calc): calc is { durationDays: number; driftSeconds: number } => !!calc);

        if (driftCalculations.length === 0) return undefined;

        const overallMeasure = driftCalculations.reduce(
            (accumulator, calc) => ({
                durationDays: accumulator.durationDays + calc.durationDays,
                driftSeconds: accumulator.driftSeconds + calc.driftSeconds,
            }),
            { durationDays: 0, driftSeconds: 0 },
        );

        const driftSecondsPerDay = overallMeasure.driftSeconds / overallMeasure.durationDays;
        const niceDisplay = driftSecondsPerDay >= 0
            ? `${driftSecondsPerDay.toFixed(1)} s/d fast`
            : `${(-driftSecondsPerDay).toFixed(1)} s/d slow`;

        return {
            durationDays: overallMeasure.durationDays.toFixed(0),
            driftSeconds: Math.round(overallMeasure.driftSeconds),
            niceDisplay,
        };
    }

    /**
     * Group measurements into periods based on isStart flag
     * Each period starts with a START measurement and includes all subsequent non-START measurements
     * The oldest measurement is always treated as START
     * Returns periods sorted by first measurement date (newest period first)
     */
    static groupMeasurementsIntoPeriods(measurements: EnrichedMeasurement[]): MeasurementPeriod[] {
        if (!measurements || measurements.length === 0) return [];

        // Sort by createdAt ascending (oldest first)
        const sorted = [...measurements].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Ensure the oldest measurement is treated as START
        sorted[0].isStart = true;

        const periods: MeasurementPeriod[] = [];
        let currentPeriod: EnrichedMeasurement[] = [];

        for (const measurement of sorted) {
            if (measurement.isStart && currentPeriod.length > 0) {
                // Start of a new period - save the previous one
                periods.push(this.createPeriod(currentPeriod));
                currentPeriod = [];
            }
            currentPeriod.push(measurement);
        }

        // Don't forget the last period
        if (currentPeriod.length > 0) {
            periods.push(this.createPeriod(currentPeriod));
        }

        // Sort periods by first measurement date (newest first)
        return periods.reverse();
    }

    /**
     * Create a period object from a list of measurements
     */
    private static createPeriod(measurements: EnrichedMeasurement[]): MeasurementPeriod {
        const first = measurements[0];
        const last = measurements[measurements.length - 1];

        // Calculate period drift from first to last measurement
        let periodDrift = "n/a";
        if (measurements.length >= 2) {
            const durationMS = new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime();
            const driftSeconds = last.value - first.value;
            const durationDays = durationMS / (24 * 60 * 60 * 1000);

            if (durationDays > 0) {
                const driftPerDay = driftSeconds / durationDays;
                const sign = driftPerDay >= 0 ? "+" : "";
                periodDrift = `${sign}${driftPerDay.toFixed(1)} s/d`;
            }
        }

        return {
            measurements: measurements.slice().reverse(),
            firstDate: first.createdAtFormatted,
            lastDate: last.createdAtFormatted,
            periodDrift,
        };
    }
}
