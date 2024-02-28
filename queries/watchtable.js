const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function main() {
    let watches = await prisma.watch.findMany({
        //where user == grafg
        where: {
            user: {
                name: 'grafg',
            },
        }, // select name
        select: {
            name: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
    watches.forEach((watch) => {
        console.log(watch);
    });
}
main().then(() => {
    process.exit(0);
});
