import { Router } from "express";
import * as express from "express";
import TimeZone from "../classes/timeZone.ts";
import { UserService, WatchService } from "../service/index.ts";

const router = Router();
router.patch("", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;

    if ("timeZone" in req.body && !TimeZone.timeZones.includes(req.body.timeZone)) {
        return res.status(422).send("Unknown / invalid time zone");
    }

    // Update the user
    const updatedUser = await UserService.updateUser(userId, {
        timeZone: req.body.timeZone,
        name: req.body.name,
    });

    req.session.user = updatedUser; // Update session with new user data
    const userWatches = await WatchService.getUserWatches(userId);
    const watch = await WatchService.getUserWatchWithMeasurements(userId);
    return res.render("body-auth", {
        user: updatedUser,
        timeZones: TimeZone.timeZones,
        userWatches,
        watch,
    });
});

export default router;
