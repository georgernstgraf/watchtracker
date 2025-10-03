import prisma from "../lib/db.ts";
import dbEntity from "./dbEntity.ts";
const Measurement = require("./measurement.ts");
export default class Watch extends dbEntity {
    constructor(data) {
        super(data, prisma.watch);
    }
    static async userWatchWithMeasurements(user, watchId) {
        let whereClause;
        if (watchId) {
            // include user because it might not be his watch
            whereClause = { id: watchId, user: { id: user.id } };
        } else {
            whereClause = { lastUserId: user.id };
        }
        const rawWatch = await prisma.watch.findFirst({
            // TODO findUnique should work!!
            where: whereClause,
            include: {
                measurements: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        if (!rawWatch) return rawWatch;
        const watch = new Watch(rawWatch);
        // now cook the stuff for rendering:
        watch.measurements = watch.measurements.map((e) => new Measurement(e));
        watch.overallMeasure = Measurement.calculateDrifts(
            watch["measurements"],
        );
        watch.measurements.forEach((m) => m.setDisplayData(user.timeZone));
        return watch;
    }
    static async userWatch(user, watchId) {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId, user: { id: user.id } },
            include: { user: true },
        });
        if (!watch) return;
        return new Watch(watch);
    }
    static async userWatches(user) {
        return (
            await prisma.watch.findMany({
                where: { user: { id: user.id } },
            })
        )?.map((w) => new Watch(w));
    }
    static async belongsToUser(watchId, user) {
        const ownedIds = (
            await prisma.watch.findMany({
                where: { user: { id: user.id } },
                select: { id: true },
            })
        ).map((e) => e.id);
        return ownedIds.includes(watchId);
    }
    static async deleteIDForUser(watchId, user) {
        await prisma.watch.delete({
            where: { id: watchId, user: { id: user.id } },
        });
    }
}
Watch;
