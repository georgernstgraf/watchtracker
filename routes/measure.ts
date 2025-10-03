import * as express from "express";
import Measurement from "../classes/measurement.ts";
import Watch from "../classes/watch.ts";

const router = express.Router(); // new Router
router.post("/:id", async (req: express.Request, res: express.Response) => {
    // this is a watchId here!!
    const watchId = req.params.id;
    const user = req.session.user;
    const watch = await Watch.userWatch(user, watchId);
    if (!watch) {
        return res.status(403).send("Wrong Watch ID");
    }
    const m = new Measurement({
        watchId,
        watch,
    });
    m.patch(req.body);
    await m.save();
    const watchFull = await Watch.userWatchWithMeasurements(user, watchId);
    res.locals.watch = watchFull;
    return res.render("measurements");
});
router.delete("/:id", async (req: express.Request, res: express.Response) => {
    const user = req.session.user;
    const measureId = req.params.id;
    const watchId = await Measurement.watchIdForMeasureOfUser(measureId, user);
    if (!watchId) {
        return res.status(403).send("Wrong Measurement ID");
    }
    await Measurement.delete(measureId);
    const watch = await Watch.userWatchWithMeasurements(user, watchId);

    res.locals.watch = watch;
    return res.render("measurements");
});
router.patch("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = req.session.user;
    try {
        const measureId = req.params.id;
        const measure = await Measurement.getUserMeasurement(user, measureId);
        if (!measure) {
            return res.status(403).send("Wrong Measurement ID");
        }
        const watchId = measure["watchId"];
        if (!req.body.isStart) {
            req.body.isStart = false;
        }
        try {
            measure.patch(req.body); // this is browser localtime
        } catch (e: unknown) {
            const error = e as Error;
            return res.status(422).send(error.message);
        }
        await measure.save();
        const watch = await Watch.userWatchWithMeasurements(user, watchId);
        return res.render("measurements", { watch });
    } catch (err) {
        next(err);
    }
});

export default router;
