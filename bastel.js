const { prisma } = require('./lib/db');
const M = require('./classes/measurement');
const U = require('./classes/user');
async function doIt() {
    const uid = 'clvf09dvb00007ef9i040xat8';
    const uname = 'grafg';
    const wid = 'clvf09dvo00027ef9eke68rvj';
    return await prisma.user.findUnique({
        where: { name: uname },
        select: { tzOffset: true }
    });
}
doIt()
    .then(async (res) => {
        console.log(JSON.stringify(res, null, 2));
        await prisma.$disconnect();
        console.log('done');
    })
    .catch((e) => console.log(e.message));
