// function for the authRouter that enforces a user, use as middleware
const validSessionUser = require('./validSessionUser.js');
module.exports = function (req, res, next) {
    let user;
    try {
        user = validSessionUser(req.session);
    } catch (e) {
        console.log("Error in enforceUser.js");
        console.log(e);
        return res.status(401).send(e.message);
    }
    res.locals.user = user;
    next();
};