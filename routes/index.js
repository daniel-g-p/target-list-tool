import { Router } from "express";

import { tryCatch } from "../utilities/try-catch.js";

import middleware from "../middleware/index.js";
import controller from "../controllers/index.js";

const router = Router();

router
  .route("/login")
  .all(middleware.isLoggedOut)
  .get(tryCatch(controller.getLogin))
  .post(tryCatch(controller.postLogin));

router.post("/logout", tryCatch(controller.postLogout));

// Authentication middleware
router.get("/", middleware.isLoggedIn, tryCatch(controller.getNavigation));

router.get("/build-account-list", tryCatch(controller.getAccounts));
router.get("/scan-websites", tryCatch(controller.getScans));
router.get("/build-prospect-list", tryCatch(controller.getProspects));
router.get("/build-contact-list", tryCatch(controller.getContacts));

export default router;
