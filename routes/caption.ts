import { WatchService } from "../service/index.ts";
import * as express from "express";

const router = express.Router();
router.get("/:id", async (req: express.Request, res: express.Response) => {
    const userId = req.session.user.id;
    const watchId = req.params.id;

    // Use WatchService to get the user's watch with ownership validation
    const watch = await WatchService.getUserWatchWithMeasurements(userId, watchId);
    if (!watch) {
        return res.status(403).send("Wrong Watch ID");
    }

    res.locals.watch = watch;
    res.locals.edit = true;
    return res.render("caption");
});
router.get("/", (_req: express.Request, res: express.Response) => {
    // Das ist unschön, rendert das input feld für einen neue caption
    res.locals.edit = true;
    return res.render("caption");
});

export default router;
