import express from "express";
import { UserService, WatchService } from "../service/index.ts";

const router = express.Router();
// This route renders the measurements table incl. headings
async function handleGet(id: string, req: express.Request, res: express.Response) {
    const userId = req.session.user.id;
    const watch = await WatchService.getUserWatchWithMeasurements(userId, id);
    if (!watch) {
        return res.status(403).send("Wrong Watch ID");
    }
    await UserService.setLastWatch(userId, watch.id);
    res.locals.watch = watch;
    return res.render("measurements");
}
router.get("/:id", async (req: express.Request, res: express.Response) => {
    return await handleGet(req.params.id, req, res);
});
router.get("/", async (req: express.Request, res: express.Response) => {
    return await handleGet(req.query.id as string, req, res);
});
// This route only renders the caption (patching only name and comment)
router.patch("/:id", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;
    const watch = await WatchService.getUserWatchWithMeasurements(userId, req.params.id);
    if (!watch) {
        return res.status(403).send("This is not your watch");
    }

    // Update the watch
    await WatchService.updateWatch(req.params.id, {
        name: req.body.name,
        comment: req.body.comment,
    });

    const updatedWatch = await WatchService.getUserWatchWithMeasurements(userId, req.params.id);
    res.locals.watch = updatedWatch;
    res.locals.userWatches = await WatchService.getUserWatches(userId);
    return res.render("allButHeadAndFoot");
});
router.post("/", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;

    try {
        const watch = await WatchService.createWatch({
            name: req.body.name,
            comment: req.body.comment,
            user: { connect: { id: userId } },
        });

        await UserService.setLastWatch(userId, watch.id);
        res.locals.userWatches = await WatchService.getUserWatches(userId);
        res.locals.watch = await WatchService.getUserWatchWithMeasurements(userId, watch.id);
        return res.render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        return res.status(422).send(error.message);
    }
});
router.delete("/:id", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;

    try {
        await WatchService.deleteWatch(req.params.id, userId);
        res.locals.userWatches = await WatchService.getUserWatches(userId);
        return res.render("allButHeadAndFoot");
    } catch (_e) {
        return res.status(403).send("Watch not found or access denied");
    }
});
export default router;
