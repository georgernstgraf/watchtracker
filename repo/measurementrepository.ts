import { prisma } from "../lib/db.ts";
import type { Measurement, Prisma } from "generated-prisma-client";

export class MeasurementRepository {
    /**
     * Create a new measurement
     */
    static async create(data: Prisma.MeasurementCreateInput): Promise<Measurement> {
        return await prisma.measurement.create({
            data,
        });
    }

    /**
     * Find a measurement by unique identifier
     */
    static async findUnique(where: Prisma.MeasurementWhereUniqueInput): Promise<Measurement | null> {
        return await prisma.measurement.findUnique({
            where,
        });
    }

    /**
     * Find the first measurement matching the criteria
     */
    static async findFirst(where?: Prisma.MeasurementWhereInput): Promise<Measurement | null> {
        return await prisma.measurement.findFirst({
            where,
        });
    }

    /**
     * Find many measurements with optional filtering, ordering, and pagination
     */
    static async findMany(params?: {
        where?: Prisma.MeasurementWhereInput;
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Measurement[]> {
        return await prisma.measurement.findMany(params);
    }

    /**
     * Update a measurement
     */
    static async update(params: {
        where: Prisma.MeasurementWhereUniqueInput;
        data: Prisma.MeasurementUpdateInput;
    }): Promise<Measurement> {
        const { where, data } = params;
        return await prisma.measurement.update({
            where,
            data,
        });
    }

    /**
     * Update many measurements
     */
    static async updateMany(params: {
        where?: Prisma.MeasurementWhereInput;
        data: Prisma.MeasurementUpdateInput;
    }): Promise<{ count: number }> {
        const { where, data } = params;
        return await prisma.measurement.updateMany({
            where,
            data,
        });
    }

    /**
     * Delete a measurement
     */
    static async delete(where: Prisma.MeasurementWhereUniqueInput): Promise<Measurement> {
        return await prisma.measurement.delete({
            where,
        });
    }

    /**
     * Delete many measurements
     */
    static async deleteMany(where?: Prisma.MeasurementWhereInput): Promise<{ count: number }> {
        return await prisma.measurement.deleteMany({
            where,
        });
    }

    /**
     * Count measurements
     */
    static async count(where?: Prisma.MeasurementWhereInput): Promise<number> {
        return await prisma.measurement.count({
            where,
        });
    }

    /**
     * Find measurement with its watch
     */
    static async findMeasurementWithWatch(where: Prisma.MeasurementWhereUniqueInput): Promise<Measurement | null> {
        return await prisma.measurement.findUnique({
            where,
            include: {
                watch: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    /**
     * Find measurements by watch ID
     */
    static async findByWatchId(watchId: string, params?: {
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Measurement[]> {
        return await prisma.measurement.findMany({
            where: { watchId },
            ...params,
        });
    }

    /**
     * Find latest measurement for a watch
     */
    static async findLatestByWatchId(watchId: string): Promise<Measurement | null> {
        return await prisma.measurement.findFirst({
            where: { watchId },
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Find measurements by date range
     */
    static async findByDateRange(params: {
        watchId?: string;
        startDate: Date;
        endDate: Date;
        orderBy?: Prisma.MeasurementOrderByWithRelationInput | Prisma.MeasurementOrderByWithRelationInput[];
    }): Promise<Measurement[]> {
        const { watchId, startDate, endDate, ...rest } = params;

        const where: Prisma.MeasurementWhereInput = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (watchId) {
            where.watchId = watchId;
        }

        return await prisma.measurement.findMany({
            where,
            ...rest,
        });
    }

    /**
     * Check if measurement exists
     */
    static async exists(where: Prisma.MeasurementWhereInput): Promise<boolean> {
        const count = await prisma.measurement.count({ where });
        return count > 0;
    }

    /**
     * Get measurement statistics for a watch
     */
    static async getMeasurementStats(watchId: string) {
        const [total, starts, stops, latest] = await Promise.all([
            prisma.measurement.count({ where: { watchId } }),
            prisma.measurement.count({ where: { watchId, isStart: true } }),
            prisma.measurement.count({ where: { watchId, isStart: false } }),
            prisma.measurement.findFirst({
                where: { watchId },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return {
            total,
            starts,
            stops,
            latest,
        };
    }

    /**
     * Calculate running measurements (start without corresponding stop)
     */
    static async getRunningMeasurements(watchId: string): Promise<Measurement[]> {
        // Find all start measurements
        const startMeasurements = await prisma.measurement.findMany({
            where: {
                watchId,
                isStart: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const runningMeasurements: Measurement[] = [];

        for (const start of startMeasurements) {
            // Check if there's a stop measurement after this start
            const stopExists = await prisma.measurement.findFirst({
                where: {
                    watchId,
                    isStart: false,
                    createdAt: {
                        gt: start.createdAt,
                    },
                },
            });

            if (!stopExists) {
                runningMeasurements.push(start);
            }
        }

        return runningMeasurements;
    }
}
