import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

import customization from "./customization.js";
const { privacyUrlKeywords, privacyFlags, cookieFlags } = customization;

config();

export default {
  // Application directory
  dirname: dirname(fileURLToPath(import.meta.url)),
  // Runtime variables
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  // Secret keys for authentication
  cookieSecret: process.env.COOKIE_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  // Administrator authentication
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  outreachDefaultOwner: process.env.OUTREACH_DEFAULT_OWNER,
  // Flagged cookies for website scans. You can customize this by adding or removing items following the following format:
  cookieFlags,
  privacyUrlKeywords,
  privacyFlags,
};
