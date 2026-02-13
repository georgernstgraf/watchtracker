import { UserRepository } from "../repo/userRepository.ts";
import { WatchRepository } from "../repo/watchRepository.ts";
import { NotFoundError } from "../lib/errors.ts";
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
     * Get user by ID (alias for findUserById)
     */
    static async getUserById(id: string): Promise<User | null> {
        return await this.findUserById(id);
    }

    /**
     * Find user by name
     */
    static async getUserByName(name: string): Promise<User> {
        const user = await UserRepository.findByName(name);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }

    /**
     * Get or create user by name - ensures user exists
     */
    static async ensureUserExists(userName: string): Promise<User> {
        const existingUser = await UserRepository.findByName(userName);
        if (existingUser) {
            return existingUser;
        }
        return await UserRepository.create({ name: userName });
    }

    /**
     * Update user information
     */
    static async updateUser(username: string, updateData: Prisma.UserUpdateInput): Promise<User> {
        return await UserRepository.update({
            where: { name: username },
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
    static async setLastWatch(username: string, watchId: string): Promise<User> {
        return await UserRepository.update({
            where: { name: username },
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
