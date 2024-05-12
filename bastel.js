const prisma = require('./lib/db');
const M = require('./classes/measurement');
const U = require('./classes/user');
const dbEntity = require('./classes/dbEntity');
async function doIt() {
    const uid = 'clvf09dvb00007ef9i040xat8';
    const uname = 'grafg';
    const wid = 'clvf09dvo00027ef9eke68rvj';
    const data = { a: 1, b: 2 };
    const ent = new dbEntity(data);
    ent.urxn = 'foo';
    ent.foo = 'bar';
    console.log(JSON.stringify(ent, null, 2));
}
doIt()
    .then(async (res) => {
        console.log(JSON.stringify(res, null, 2));
        await prisma.$disconnect();
        console.log('done');
    })
    .catch((e) => console.log(e.message));
