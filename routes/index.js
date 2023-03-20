import { Router } from "express";

import { tryCatch } from "";

import controller from "../controllers/index.js";

const router = Router();

router
  .route("/login")
  .get(tryCatch(controller.getLogin))
  .post(tryCatch(controller.postLogin));

router.get("/navigation", tryCatch(controller.getNavigation));

router.get("/build-account-list", tryCatch(controller.getAccounts));

router.get("/scan-websites", tryCatch(controller.getScans));

router.get("/build-person-list", tryCatch(controller.getPersons));

router.get("/build-contact-list", tryCatch(controller.getContacts));

router.get("/import-outreach-data", tryCatch(controller.getImports));

export default router;
