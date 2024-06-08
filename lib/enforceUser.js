// function for the authRouter that enforces a user
const prismaUser = require('../lib/db').user;
module.exports = function (req, res, next) {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send("Not Authenticated");
    }
    Object.keys(prismaUser.fields).forEach((key) => {
        if (!key in user) {
            req.session.destroy();
            console.log(`Destroyed session for ${user.email} because of missing key ${key} in user session object.`);
            return res.status(401).send("Not Authenticated");
        }
    });
    res.locals.user = user;
    next();
};