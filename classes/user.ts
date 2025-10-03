import prisma from "../lib/db.ts";
import dbEntity from "./dbEntity.ts";
import type { Prisma } from "generated-prisma-client";

export default class User extends dbEntity {
    constructor(data: Prisma.UserCreateInput) {
        super(data, prisma.user);
    }
    static async setLastWatchIdForUserId(watchId, userId) {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                lastWatch: { connect: { id: watchId } },
            },
        });
    }
    static async setLastWatchIdForUser(watchId, user) {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastWatch: { connect: { id: watchId } },
            },
        });
    }
    static async enforceExists(userName) {
        const user = await prisma.user.upsert({
            where: { name: userName },
            update: {},
            create: { name: userName },
        });
        return new User(user);
    }
}
