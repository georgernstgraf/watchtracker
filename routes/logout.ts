import { Router } from "express";
import { logoutCookie } from "../lib/session.ts";

const router = Router();
// this gets the login form req.body.passwd, req.body.user
router.post("/", async (req, res) => {
  req.session.destroy();
  res.cookie(process.env.COOKIE_NAME, "logout", logoutCookie);
  if (req.headers["hx-request"]) {
    return res.render("login-body");
  }
  return res.render("login-full");
});
export default router;
