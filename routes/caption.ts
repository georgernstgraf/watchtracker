import Watch from "../classes/watch.ts";
import * as express from "express";

const router = express.Router();
router.get("/:id", async (req: express.Request, res: express.Response) => {
  const watch = await Watch.userWatch(req.session.user, req.params.id);
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
