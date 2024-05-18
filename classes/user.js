const prisma = require('../lib/db');
const dbEntity = require('./dbEntity');
class User extends dbEntity {
    constructor(data) {
        super(data, prisma.user);
    }
    static async setLastWatchIdForUserId(watchId, userId) {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                lastWatch: { connect: { id: watchId } }
            }
        });
    }
    static async setLastWatchIdForUser(watchId, userName) {
        await prisma.user.update({
            where: {
                name: userName
            },
            data: {
                lastWatch: { connect: { id: watchId } }
            }
        });
    }
    static async tzOffsetForName(userName) {
        return (
            await prisma.user.findUnique({
                where: { name: userName },
                select: { tzOffset: true }
            })
        ).tzOffset;
    }
    static async enforceExists(userName) {
        await prisma.user.upsert({
            where: { name: userName },
            update: {},
            create: { name: userName }
        });
    }
}
module.exports = User;
