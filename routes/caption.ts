import { Router } from "express";
import Watch from "../classes/watch.ts";

const router = Router();
router.get("/:id", async (req, res) => {
    // caption for watchID
    const watch = await Watch.userWatch(req.session.user, req.params.id);
    if (!watch) {
        return res.status(403).send("Wrong Watch ID");
    }
    res.locals.watch = watch;
    res.locals.edit = true;
    return res.render("caption");
});
router.get("/", async (req, res) => {
    // Das ist unschön, rendert das input feld für einen neue caption
    res.locals.edit = true;
    return res.render("caption");
});

export default router;
