import { Server } from "socket.io";

import jwt from "./jsonwebtoken.js";

export default (httpServer, callback) => {
  const server = new Server(httpServer);
  server
    .use((socket, next) => {
      const token = socket.handshake.headers.cookie
        .split(";")
        .map((cookie) => {
          const parts = cookie.split("=");
          return { key: parts[0], value: parts.slice(1).join("") };
        })
        .find((cookie) => (cookie.key = "auth"));
      const jwtData = jwt.verify(token.value);
      const isAuthenticated = jwtData && jwtData.exp * 1000 > Date.now();
      if (isAuthenticated) {
        next();
      }
    })
    .on("connection", (socket) => {
      const io = {
        listen(event, callback) {
          socket.on(event, callback);
        },
        emit(event, payload) {
          socket.emit(event, payload);
        },
      };
      callback(io);
    });
};
