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
  const cookieChecks = config.cookieFlags;
  const privacyChecks = config.privacyFlags;
  const checks = [
    ...cookieChecks.map((item) => item.fullLabel),
    ...privacyChecks.map((item) => item.fullLabel),
  ];
  return res.render("03-scan-websites", { checks });
};

const getScanWebsitesTemplate = async (req, res) => {
  const filePath = config.dirname + "/files/scan_websites_list_template.xlsx";
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fileDate =
    year + (month < 10 ? "0" + month : month) + (day < 10 ? "0" + day : day);
  const fileName = fileDate + "-website_scan_template.xlsx";
  return res.download(filePath, fileName);
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
  getScanWebsitesTemplate,
  getBuildProspectList,
  getBuildContactList,
};
