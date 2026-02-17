import { prisma } from "../lib/db.ts";
import type { Prisma, User } from "generated-prisma-client";

export class UserRepository {
    /**
     * Create a new user
     */
    static async create(data: Prisma.UserCreateInput): Promise<User> {
        return await prisma.user.create({
            data,
        });
    }

    /**
     * Find a user by unique identifier
     */
    static async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await prisma.user.findUnique({
            where,
        });
    }

    /**
     * Find the first user matching the criteria
     */
    static async findFirst(where?: Prisma.UserWhereInput): Promise<User | null> {
        return await prisma.user.findFirst({
            where,
        });
    }

    /**
     * Find many users with optional filtering, ordering, and pagination
     */
    static async findMany(params?: {
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
        take?: number;
        skip?: number;
    }): Promise<User[]> {
        return await prisma.user.findMany(params);
    }

    /**
     * Update a user
     */
    static async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        return await prisma.user.update({
            where,
            data,
        });
    }

    /**
     * Update many users
     */
    static async updateMany(params: {
        where?: Prisma.UserWhereInput;
        data: Prisma.UserUpdateInput;
    }): Promise<{ count: number }> {
        const { where, data } = params;
        return await prisma.user.updateMany({
            where,
            data,
        });
    }

    /**
     * Delete a user
     */
    static async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return await prisma.user.delete({
            where,
        });
    }

    /**
     * Delete many users
     */
    static async deleteMany(where?: Prisma.UserWhereInput): Promise<{ count: number }> {
        return await prisma.user.deleteMany({
            where,
        });
    }

    /**
     * Count users
     */
    static async count(where?: Prisma.UserWhereInput): Promise<number> {
        return await prisma.user.count({
            where,
        });
    }

    /**
     * Find user with their watches
     */
    static async findUserWithWatches(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await prisma.user.findUnique({
            where,
            include: {
                watches: true,
                lastWatch: true,
            },
        });
    }

    /**
     * Find user by name
     */
    static async findByName(name: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { name },
        });
    }

    /**
     * Check if user exists
     */
    static async exists(where: Prisma.UserWhereInput): Promise<boolean> {
        const count = await prisma.user.count({ where });
        return count > 0;
    }
}
