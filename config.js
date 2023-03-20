import { config } from "dotenv";

config();

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  cookieSecret: process.env.COOKIE_SECRET,

  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
};
