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
router.get("/", middleware.isLoggedIn, tryCatch(controller.getHome));

router.get(
  "/scan-websites",
  middleware.isLoggedIn,
  tryCatch(controller.getScanWebsites)
);

router.get(
  "/build-prospect-list",
  middleware.isLoggedIn,
  tryCatch(controller.getBuildProspectList)
);

router.get(
  "/build-contact-list",
  middleware.isLoggedIn,
  tryCatch(controller.getBuildContactList)
);

export default router;
