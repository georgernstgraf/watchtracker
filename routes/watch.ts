import { Router } from "express";
import Watch from "../classes/watch.ts";
import User from "../classes/user.ts";

const router = Router();
// This route renders the measurements table incl. headings
async function handleGet(id, req, res) {
    const watch = await Watch.userWatchWithMeasurements(req.session.user, id);
    if (!watch) {
        return res.status(403).send("Wrong Watch ID");
    }
    await User.setLastWatchIdForUserId(watch.id, req.session.user.id);
    res.locals.watch = watch;
    return res.render("measurements");
}
router.get("/:id", async (req, res) => {
    return await handleGet(req.params.id, req, res);
});
router.get("/", async (req, res) => {
    return await handleGet(req.query.id, req, res);
});
// This route only renders the caption (patching only name and comment)
router.patch("/:id", async (req, res) => {
    const user = req.session.user;
    const watch = await Watch.userWatchWithMeasurements(user, req.params.id);
    if (!watch) {
        return res.status(403).send("This is not your watch");
    }
    watch.patch(req.body);
    await watch.save();
    res.locals.watch = watch;
    res.locals.userWatches = await Watch.userWatches(user);
    return res.render("allButHeadAndFoot");
});
router.post("/", async (req, res) => {
    const user = req.session.user;
    let watch = new Watch(req.body);
    watch.userId = user.id;
    try {
        await watch.save();
    } catch (e) {
        return res.status(422).send(e.message);
    }
    await User.setLastWatchIdForUser(watch.id, user);
    res.locals.userWatches = await Watch.userWatches(user);
    res.locals.watch = await Watch.userWatchWithMeasurements(user, watch.id);
    return res.render("allButHeadAndFoot");
});
router.delete("/:id", async (req, res) => {
    const user = req.session.user;
    await Watch.deleteIDForUser(req.params.id, user);
    res.locals.userWatches = await Watch.userWatches(user);
    return res.render("allButHeadAndFoot");
});
export default router;
