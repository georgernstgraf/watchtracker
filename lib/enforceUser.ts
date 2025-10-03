// function for the authRouter that enforces a user, use as middleware
const validSessionUser = require("./validSessionUser.js");
export default function (req: any, res: any, next: any) {
    let user;
    try {
        user = validSessionUser(req.session);
    } catch (e: any) {
        console.log("Error in enforceUser.js");
        console.log(e);
        return res.status(401).send(e.message);
    }
    res.locals.user = user;
    next();
}
