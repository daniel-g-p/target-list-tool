import config from "../config.js";

import service from "../services/index.js";

const getLogin = async (req, res) => {
  return res.render("login");
};

const postLogin = async (req, res) => {
  await service.wait(1000);
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
    const token = service.jsonWebToken(timeToLiveSeconds);
    const options = {
      maxAge: timeToLiveSeconds * 1000,
      secure: config.env !== "development",
    };
    res.cookie("auth", token, options);
    return res.redirect("/");
  } else {
    res.locals.error = "Login failed, please try again";
    return res.render("login");
  }
};

const postLogout = async (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/login");
};

const getHome = async (req, res) => {
  const cookieChecks = config.cookieFlags;
  const privacyChecks = config.privacyFlags;
  const checks = [
    ...cookieChecks.map((item) => item.fullLabel),
    ...privacyChecks.map((item) => item.fullLabel),
  ];
  return res.render("home", { checks });
};

const getTemplate = async (req, res) => {
  const filePath = config.dirname + "/files/target_list_template.xlsx";
  const fileName = service.yyyymmdd() + "-target_list_template.xlsx";
  return res.download(filePath, fileName);
};

const getOutput = async (req, res) => {
  const { fileName } = req.params;
  const filePath = config.dirname + "/output/" + fileName + ".xlsx";
  const downloadName = fileName + "-target_list.xlsx";
  return res.download(filePath, downloadName, {}, () => {
    service.deleteFile(filePath);
  });
};

export default {
  getLogin,
  postLogin,
  postLogout,
  getHome,
  getTemplate,
  getOutput,
};
