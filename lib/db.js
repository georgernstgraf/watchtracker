// db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(/* { log: ['query'] } */);

// TODO watch class!!

async function watchBelongsToUser(watchId, userName) {
    const ownsIds = (
        await prisma.watch.findMany({
            where: { user: { name: userName } },
            select: { id: true }
        })
    ).map((e) => e.id);
    return ownsIds.includes(watchId);
}

module.exports = {
    prisma,
    watchBelongsToUser
};
