import config from "../config.js";

import service from "../services/index.js";

const getLogin = async (req, res) => {
  return res.render("login");
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
    const cookieValue = service.generateCookieValue();
    const cookieOptions = {
      maxAge: 1000 * 60 * 60 * 12,
      secure: config.env !== "development",
      signed: true,
    };
    res.cookie("auth", cookieValue, cookieOptions);
    return res.redirect("/navigation");
  } else {
    return res.render("login");
  }
};

const postLogout = async (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/login");
};

const getNavigation = async (req, res) => {
  return res.render("navigation");
};

const getAccounts = async (req, res) => {
  return res.render("accounts");
};

const getScans = async (req, res) => {
  return res.render("scans");
};

const getProspects = async (req, res) => {
  return res.render("prospects");
};

const getContacts = async (req, res) => {
  return res.render("contacts");
};

export default {
  getLogin,
  postLogin,
  postLogout,
  getNavigation,
  getAccounts,
  getScans,
  getProspects,
  getContacts,
};
