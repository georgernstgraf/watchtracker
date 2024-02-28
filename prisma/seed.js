const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
const { fakerDE } = require('@faker-js/faker');
async function main() {
    await prisma.measurement.deleteMany();
    await prisma.watch.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
        data: {
            name: 'grafg',
        },
    });
    const watches = ['constellation', 'elgin'];
    for (const watch of watches) {
        await prisma.watch.create({
            data: {
                name: watch,
                user: {
                    connect: {
                        name: 'grafg',
                    },
                },
            },
        });
    }
    const watchIds = (
        await prisma.watch.findMany({
            where: {
                user: {
                    name: 'grafg',
                },
            },
            select: {
                id: true,
            },
        })
    ).map((watch) => watch.id);
    // query my elgin
    const elgin = await prisma.watch.findFirst({
        where: {
            name: 'elgin',
            user: {
                name: 'grafg',
            },
        },
    });
    //console.log(elgin);
    for (let i = 0; i < 7; i++) {
        await prisma.measurement.create({
            data: {
                createdAt: fakerDE.date.past(),
                value: fakerDE.number.int({ min: -100, max: 100 }),
                isStart: Math.random() < 0.5,
                watch: {
                    connect: {
                        id: watchIds[
                            Math.floor(Math.random() * watchIds.length)
                        ],
                    },
                },
            },
        });
    }
    await prisma.$disconnect();
}
main()
    .then(() => {
        console.log('seeded');
        process.exit(0);
    })
    .catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
