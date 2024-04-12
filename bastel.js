const { prisma, fixMeasurements } = require('./lib/db');

async function main() {
    const m = await prisma.measurement.findFirst();
    return m;
}
main().then(() => prisma.$disconnect());
