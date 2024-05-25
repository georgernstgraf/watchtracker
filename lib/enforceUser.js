module.exports = function (req, res, next) {
    const str = "invoking enforce";
    const user = req.session.user;
    if (!user) {
        console.log(`${str}: NOPE`);
        return res.status(401).send("Not Authenticated");
    }
    console.log(`${str}: YEP`);
    res.locals.user = user;
    next();
};