import express from "express";
import { UserService, WatchService } from "../service/index.ts";

const router = express.Router();
// This route renders the measurements table incl. headings
async function handleGet(id: string, req: express.Request, res: express.Response) {
    try {
        const user = UserService.validateSessionUser(req.session);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id, id);
        if (!watch) {
            return res.status(403).send("Wrong Watch ID");
        }
        await UserService.setLastWatch(user.id, watch.id);
        res.locals.watch = watch;
        return res.render("measurements");
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in watch route:", error.message);
        return res.status(401).send(error.message);
    }
}
router.get("/:id", async (req: express.Request, res: express.Response) => {
    return await handleGet(req.params.id, req, res);
});
router.get("/", async (req: express.Request, res: express.Response) => {
    return await handleGet(req.query.id as string, req, res);
});
// This route only renders the caption (patching only name and comment)
router.patch("/:id", async (req: express.Request, res: express.Response) => {
    try {
        const user = UserService.validateSessionUser(req.session);
        const watch = await WatchService.getUserWatchWithMeasurements(user.id, req.params.id);
        if (!watch) {
            return res.status(403).send("This is not your watch");
        }

        // Update the watch
        await WatchService.updateWatch(req.params.id, {
            name: req.body.name,
            comment: req.body.comment,
        });

        const updatedWatch = await WatchService.getUserWatchWithMeasurements(user.id, req.params.id);
        res.locals.watch = updatedWatch;
        res.locals.userWatches = await WatchService.getUserWatches(user.id);
        return res.render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        console.log("Error in watch patch route:", error.message);
        return res.status(401).send(error.message);
    }
});
router.post("/", async (req: express.Request, res: express.Response) => {
    try {
        const user = UserService.validateSessionUser(req.session);
        const watch = await WatchService.createWatch({
            name: req.body.name,
            comment: req.body.comment,
            user: { connect: { id: user.id } },
        });

        await UserService.setLastWatch(user.id, watch.id);
        res.locals.userWatches = await WatchService.getUserWatches(user.id);
        res.locals.watch = await WatchService.getUserWatchWithMeasurements(user.id, watch.id);
        return res.render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message.includes("session")) {
            return res.status(401).send(error.message);
        }
        return res.status(422).send(error.message);
    }
});
router.delete("/:id", async (req: express.Request, res: express.Response) => {
    try {
        const user = UserService.validateSessionUser(req.session);
        await WatchService.deleteWatch(req.params.id, user.id);
        res.locals.userWatches = await WatchService.getUserWatches(user.id);
        return res.render("allButHeadAndFoot");
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message.includes("session")) {
            return res.status(401).send(error.message);
        }
        return res.status(403).send("Watch not found or access denied");
    }
});
export default router;
