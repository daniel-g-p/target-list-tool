import cookieParser from "cookie-parser";
import express from "express";

import config from "./config.js";

import startWebsocket from "./utilities/socket-io.js";

import router from "./routes/index.js";
import websocket from "./websockets/index.js";

const app = express();

// View engine
app.set("view engine", "ejs");

// Global middleware
app.use(express.static(config.dirname + "/public"));
app.use(cookieParser(config.cookieSecret));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health-check", (req, res) => {
  return res.status(200).json({ id: Date.now() });
});

// Application router
app.use(router);

// Catch-all route
app.use((req, res, next) => {
  if (req.originalUrl === "/favicon.ico") {
    return res.status(404).end();
  } else {
    const error = new Error(404);
    next(error);
  }
});

// Error handler
app.use((error, req, res, next) => {
  if (config.env === "development") {
    console.log(error);
  }
  const errorCode = +error.message || 500;
  return res.redirect(errorCode === 401 ? "/login" : "/");
});

// Application initialization
const start = () => {
  const server = app.listen(config.port, () => {
    console.log("Server running on http://localhost:" + config.port);
  });
  startWebsocket(server, (io) => {
    websocket(io);
  });
};

start();
