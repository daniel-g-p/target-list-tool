import crypto from "crypto";

import jwt from "../utilities/jsonwebtoken.js";

const generateJSONWebToken = (timeToLiveSeconds) => {
  return jwt.sign({}, timeToLiveSeconds);
};

export default { generateJSONWebToken };
