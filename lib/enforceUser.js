// function for the authRouter that enforces a user
module.exports = function (req, res, next) {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send("Not Authenticated");
    }
    res.locals.user = user;
    next();
};