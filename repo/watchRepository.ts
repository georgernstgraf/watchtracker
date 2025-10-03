import db from "../lib/db.ts";
import type { Prisma, Watch } from "generated-prisma-client";

export class WatchRepository {
    /**
     * Create a new watch
     */
    static async create(data: Prisma.WatchCreateInput): Promise<Watch> {
        return await db.watch.create({
            data,
        });
    }

    /**
     * Find a watch by unique identifier
     */
    static async findUnique(where: Prisma.WatchWhereUniqueInput): Promise<Watch | null> {
        return await db.watch.findUnique({
            where,
        });
    }

    /**
     * Find the first watch matching the criteria
     */
    static async findFirst(where?: Prisma.WatchWhereInput): Promise<Watch | null> {
        return await db.watch.findFirst({
            where,
        });
    }

    /**
     * Find many watches with optional filtering, ordering, and pagination
     */
    static async findMany(params?: {
        where?: Prisma.WatchWhereInput;
        orderBy?: Prisma.WatchOrderByWithRelationInput | Prisma.WatchOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<Watch[]> {
        return await db.watch.findMany(params);
    }

    /**
     * Update a watch
     */
    static async update(params: {
        where: Prisma.WatchWhereUniqueInput;
        data: Prisma.WatchUpdateInput;
    }): Promise<Watch> {
        const { where, data } = params;
        return await db.watch.update({
            where,
            data,
        });
    }

    /**
     * Update many watches
     */
    static async updateMany(params: {
        where?: Prisma.WatchWhereInput;
        data: Prisma.WatchUpdateInput;
    }): Promise<{ count: number }> {
        const { where, data } = params;
        return await db.watch.updateMany({
            where,
            data,
        });
    }

    /**
     * Delete a watch
     */
    static async delete(where: Prisma.WatchWhereUniqueInput): Promise<Watch> {
        return await db.watch.delete({
            where,
        });
    }

    /**
     * Delete many watches
     */
    static async deleteMany(where?: Prisma.WatchWhereInput): Promise<{ count: number }> {
        return await db.watch.deleteMany({
            where,
        });
    }

    /**
     * Count watches
     */
    static async count(where?: Prisma.WatchWhereInput): Promise<number> {
        return await db.watch.count({
            where,
        });
    }

    /**
     * Find watch with its measurements and user
     */
    static async findWatchWithMeasurements(where: Prisma.WatchWhereUniqueInput): Promise<Watch | null> {
        return await db.watch.findUnique({
            where,
            include: {
                measurements: {
                    orderBy: { createdAt: "desc" },
                },
                user: true,
                lastUser: true,
            },
        });
    }

    /**
     * Find watches by user ID
     */
    static async findByUserId(userId: string): Promise<Watch[]> {
        return await db.watch.findMany({
            where: { userId },
            include: {
                measurements: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });
    }

    /**
     * Find watch by name and user ID
     */
    static async findByNameAndUserId(name: string, userId: string): Promise<Watch | null> {
        return await db.watch.findUnique({
            where: {
                name_userId: {
                    name,
                    userId,
                },
            },
        });
    }

    /**
     * Check if watch exists
     */
    static async exists(where: Prisma.WatchWhereInput): Promise<boolean> {
        const count = await db.watch.count({ where });
        return count > 0;
    }

    /**
     * Get watch statistics
     */
    static async getWatchStats(watchId: string) {
        const measurements = await db.measurement.findMany({
            where: { watchId },
            orderBy: { createdAt: "asc" },
        });

        const totalMeasurements = measurements.length;
        const startMeasurements = measurements.filter((m) => m.isStart);
        const stopMeasurements = measurements.filter((m) => !m.isStart);

        return {
            totalMeasurements,
            startMeasurements: startMeasurements.length,
            stopMeasurements: stopMeasurements.length,
            firstMeasurement: measurements[0] || null,
            lastMeasurement: measurements[measurements.length - 1] || null,
        };
    }
}
