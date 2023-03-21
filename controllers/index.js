import config from "../config.js";

import service from "../services/index.js";

const getLogin = async (req, res) => {
  return res.render("01-login");
};

const postLogin = async (req, res) => {
  const username =
    req.body.username && typeof req.body.username === "string"
      ? req.body.username.trim().toLowerCase()
      : "";
  const password =
    req.body.password && typeof req.body.password === "string"
      ? req.body.password
      : "";

  if (username === config.adminUsername && password === config.adminPassword) {
    const timeToLiveSeconds = 60 * 60 * 12;
    const token = service.generateJSONWebToken(timeToLiveSeconds);
    const options = {
      maxAge: timeToLiveSeconds * 1000,
      secure: config.env !== "development",
    };
    res.cookie("auth", token, options);
    return res.redirect("/");
  } else {
    res.locals.error = "Login failed, please try again";
    return res.render("01-login");
  }
};

const postLogout = async (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/login");
};

const getHome = async (req, res) => {
  return res.render("02-home");
};

const getScanWebsites = async (req, res) => {
  return res.render("03-scan-websites");
};

const getBuildProspectList = async (req, res) => {
  return res.render("04-build-prospect-list");
};

const getBuildContactList = async (req, res) => {
  return res.render("05-build-contact-list");
};

export default {
  getLogin,
  postLogin,
  postLogout,
  getHome,
  getScanWebsites,
  getBuildProspectList,
  getBuildContactList,
};
