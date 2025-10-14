import { UserRepository } from "../repo/userRepository.ts";
import { WatchRepository } from "../repo/watchRepository.ts";
import type { Prisma, User } from "generated-prisma-client";

export class UserService {
    /**
     * Create a new user
     */
    static async createUser(userData: Prisma.UserCreateInput): Promise<User> {
        return await UserRepository.create(userData);
    }

    /**
     * Find user by ID
     */
    static async findUserById(id: string): Promise<User | null> {
        return await UserRepository.findUnique({ id });
    }

    /**
     * Find user by name
     */
    static async findUserByName(name: string): Promise<User | null> {
        return await UserRepository.findByName(name);
    }

    /**
     * Get or create user by name - ensures user exists
     */
    static async enforceUserExists(userName: string): Promise<User> {
        const existingUser = await UserRepository.findByName(userName);
        if (existingUser) {
            return existingUser;
        }
        return await UserRepository.create({ name: userName });
    }

    /**
     * Update user information
     */
    static async updateUser(userId: string, updateData: Prisma.UserUpdateInput): Promise<User> {
        return await UserRepository.update({
            where: { id: userId },
            data: updateData,
        });
    }

    /**
     * Delete a user
     */
    static async deleteUser(userId: string): Promise<User> {
        return await UserRepository.delete({ id: userId });
    }

    /**
     * Get user with all their watches
     */
    static async getUserWithWatches(userId: string): Promise<User | null> {
        return await UserRepository.findUserWithWatches({ id: userId });
    }

    /**
     * Set the last watch for a user
     */
    static async setLastWatch(userId: string, watchId: string): Promise<User> {
        return await UserRepository.update({
            where: { id: userId },
            data: {
                lastWatch: { connect: { id: watchId } },
            },
        });
    }

    /**
     * Get all users with pagination
     */
    static async getAllUsers(params?: {
        take?: number;
        skip?: number;
        orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    }): Promise<User[]> {
        return await UserRepository.findMany(params);
    }

    /**
     * Check if user exists
     */
    static async userExists(userId: string): Promise<boolean> {
        return await UserRepository.exists({ id: userId });
    }

    /**
     * Get user's watches
     */
    static async getUserWatches(userId: string) {
        return await WatchRepository.findByUserId(userId);
    }

    /**
     * Count total users
     */
    static async countUsers(): Promise<number> {
        return await UserRepository.count();
    }
}
