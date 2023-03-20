import crypto from "crypto";

const generateCookieValue = () => {
  return crypto.randomBytes(24).toString("hex");
};

export default { generateCookieValue };
