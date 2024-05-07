const { prisma } = require('../lib/db');
const dbEntity = require('./dbEntity');
class Watch extends dbEntity {
    static async userWatchWithMeasurements(user, watchId) {
        return await prisma.watch.findUnique({
            where: { id: watchId, user: { name: user } },
            include: {
                measurements: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                user: { select: { tzOffset: true } }
            }
        });
    }
    static async userWatch(user, watchId) {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId, user: { name: user } }
        });
        if (!watch) return;
        return new Watch(watch);
    }
}
module.exports = Watch;
