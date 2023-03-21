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
router.all(middleware.isLoggedIn);

// Homepage
router.get("/", tryCatch(controller.getHome));

// Scan websites
router.get("/scan-websites", tryCatch(controller.getScanWebsites));
router.get(
  "/scan-websites/template",
  tryCatch(controller.getScanWebsitesTemplate)
);

router.get("/build-prospect-list", tryCatch(controller.getBuildProspectList));

router.get("/build-contact-list", tryCatch(controller.getBuildContactList));

export default router;
