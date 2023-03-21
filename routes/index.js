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

// Homepage
router.get("/", middleware.isLoggedIn, tryCatch(controller.getHome));

// Scan websites
router.get(
  "/template",
  middleware.isLoggedIn,
  tryCatch(controller.getTemplate)
);
router.get(
  "/output/:fileName",
  middleware.isLoggedIn,
  tryCatch(controller.getOutput)
);

export default router;
