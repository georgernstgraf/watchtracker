// db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function userWatches(name) {
    return await prisma.watch.findMany({ where: { user: { name: name } } });
}
async function belongsToUser(watchId, userName) {
    const ownsIds = await prisma.watch.findMany({
        where: { user: { name: userName } },
        select: { id: true },
    });
    return ownsIds.includes(watchId);
}
async function measurements(watchId, user) {
    return await prisma.watch.findUnique({
        where: { id: watchId, user: { name: user } },
        include: {
            measurements: {
                orderBy: {
                    createdAt: 'asc',
                },
            },
        },
    });
}
async function fixMeasurements() {
    const watches = await prisma.watch.findMany({
        select: { measurements: true },
    });
    for (let i = 0; i < watches.length; i++) {
        const measurements = watches[i].measurements;
        measurements.sort((a, b) => a.createdAt - b.createdAt);
        measurements[0].isStart = true;
        if (measurements[1]) measurements[1].isStart = false;
    }

    return;
}
module.exports = {
    prisma,
    userWatches,
    belongsToUser,
    measurements,
    fixMeasurements,
};
