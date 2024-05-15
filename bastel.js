const repl = require('repl');
const User = require('./classes/user');
const prisma = require('./lib/db');
const r = repl.start();
const c = r.context;
c.User = User;
c.u = new User({ id: 7, name: 'georg' });
c.p = prisma;
