// db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function userWatches(name) {
    return await prisma.watch.findMany({ where: { user: { name: name } } });
}
async function watchBelongsToUser(watchId, userName) {
    const ownsIds = (
        await prisma.watch.findMany({
            where: { user: { name: userName } },
            select: { id: true }
        })
    ).map((e) => e.id);
    return ownsIds.includes(watchId);
}

async function measurements(watchId, user) {
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

module.exports = {
    prisma,
    userWatches,
    watchBelongsToUser,
    measurements
};
