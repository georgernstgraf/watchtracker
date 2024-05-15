const prisma = require('../lib/db');
const dbEntity = require('./dbEntity');
const Measurement = require('./measurement');
class Watch extends dbEntity {
    constructor(data) {
        super(data, prisma.watch);
    }
    static async userWatchWithMeasurements(userName, watchId) {
        let whereClause;
        if (watchId) {
            whereClause = { id: watchId, user: { name: userName } };
        } else {
            whereClause = { lastUser: { name: userName } };
        }
        const rawWatch = await prisma.watch.findFirst({
            // TODO findUnique should work!!
            where: whereClause,
            include: {
                measurements: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                user: { select: { tzOffset: true, id: true } }
            }
        });
        if (!rawWatch) return rawWatch;
        const watch = new Watch(rawWatch);
        // now cook the stuff for rendering:
        watch.measurements = watch.measurements.map((e) => new Measurement(e));
        watch.overallMeasure = Measurement.calculateDrifts(
            watch['measurements']
        );
        watch.measurements.forEach((m) => m.setDisplayData());
        return watch;
    }
    static async userWatch(userName, watchId) {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId, user: { name: userName } }
        });
        if (!watch) return;
        return new Watch(watch);
    }
    static async userWatches(userName) {
        return (
            await prisma.watch.findMany({
                where: { user: { name: userName } }
            })
        )?.map((w) => new Watch(w));
    }
    static async belongsToUser(watchId, userName) {
        const ownedIds = (
            await prisma.watch.findMany({
                where: { user: { name: userName } },
                select: { id: true }
            })
        ).map((e) => e.id);
        return ownedIds.includes(watchId);
    }
}
module.exports = Watch;
