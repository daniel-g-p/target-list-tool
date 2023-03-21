import jsonwebtoken from "jsonwebtoken";

import config from "../config.js";

const sign = (data, ttlSeconds) => {
  const options =
    typeof ttlSeconds === "number" && ttlSeconds % 1 === 0 && ttlSeconds > 0
      ? { expiresIn: ttlSeconds }
      : {};
  return jsonwebtoken.sign(data, config.jwtSecret, options);
};

const verify = (token) => {
  return jsonwebtoken.verify(token, config.jwtSecret, (error, data) => {
    return error ? null : data;
  });
};

export default { sign, verify };
