import express from "express";

import config from "./config.js";

import router from "./routes/index.js";

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/health-check", (req, res) => {
  return res.status(200).json({ id: Date.now() });
});

app.use("/", router);

app.use((req, res, next) => {
  const error = new Error("Route not found");
  next(error);
});

app.use((error, req, res, next) => {
  if (config.env === "development") {
    console.log(error);
  }
  return res.redirect("/");
});

app.listen(config.port, () => {
  if (config.env === "development") {
    console.log("Server running on http://localhost:" + config.port);
  }
});
