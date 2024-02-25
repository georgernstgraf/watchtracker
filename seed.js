const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function main() {
    await prisma.user.deleteMany();
    let watch = await prisma.watch.create({
        data: {
            name: 'Sturmanskie',
            user: { create: { name: 'grafg' } },
        },
    });
    watch = await prisma.watch.create({
        data: {
            name: 'Elgin',
            user: { connect: { name: 'grafg' } },
        },
    });
    watch = await prisma.watch.create({
        data: {
            name: 'Sturmanskie',
            user: { create: { name: 'giesmayer' } },
        },
    });

    console.log(watch);
    console.log('GRG Seed done');
}
main().then(() => {
    process.exit(0);
});
