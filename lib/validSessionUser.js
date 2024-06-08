const prismaUser = require('../lib/db').user;
function validSessionUser(session) {
    const user = session.user;
    if (!user) {
        throw new Error("No user in session.");
    }
    Object.keys(prismaUser.fields).forEach((key) => {
        if (!key in user) {
            session.destroy();
            throw new Error(`Destroyed session for ${user.email} because of missing key ${key} in user session object.`);
        }
    });
    return user;
}
module.exports = validSessionUser;
