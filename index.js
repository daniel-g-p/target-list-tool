import express from "express";

import config from "./config.js";

const app = express();

app.listen(config.port, () => {
  if (config.env === "development") {
    console.log("Server running on http://localhost:" + config.port);
  }
});
