// db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function userWatches(name) {
    return await prisma.watch.findMany({ where: { user: { name: name } } });
}
async function belongsToUser(watchId, userName) {
    const ownsIds = await prisma.watch.findMany({
        where: { user: { name: userName } },
        select: { id: true }
    });
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
            }
        }
    });
}

module.exports = {
    prisma,
    userWatches,
    belongsToUser,
    measurements
};
