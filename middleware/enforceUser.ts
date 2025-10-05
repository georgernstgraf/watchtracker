// function for the authRouter that enforces a user, use as middleware
import { UserService } from "../service/index.ts";
import type * as express from "express";

export default function (req: express.Request, res: express.Response, next: express.NextFunction) {
    let user;
    try {
        // throws if no valid user in session
        user = UserService.validateSessionUser(req.session);
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in enforceUser.js");
        console.log(error);
        return res.status(401).send(error.message);
    }
    res.locals.user = user;
    next();
}
