const prisma = require('../lib/db');
const dbEntity = require('./dbEntity');
class User extends dbEntity {
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
    static async tzOffsetForName(userName) {
        return (
            await prisma.user.findUnique({
                where: { name: userName },
                select: { tzOffset: true }
            })
        ).tzOffset;
    }
}
module.exports = User;
