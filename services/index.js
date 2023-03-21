import crypto from "crypto";
import fs from "fs";
import puppeteer from "puppeteer";
import XLSX from "xlsx";

import config from "../config.js";

import jwt from "../utilities/jsonwebtoken.js";

const wait = async (waitTime) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitTime);
  });
};

const yyyymmdd = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const yearText = year.toString();
  const monthText = month < 10 ? "0" + month : month.toString();
  const dayText = day < 10 ? "0" + day : day.toString();
  return yearText + monthText + dayText;
};

const randomHash = (bytes) => {
  const length = +bytes || 2;
  return crypto.randomBytes(length).toString("hex");
};

const jsonWebToken = (timeToLiveSeconds) => {
  return jwt.sign({}, timeToLiveSeconds);
};

const validateUrl = (url) => {
  const regex =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  return regex.test(url);
};

const readList = (fileBuffer) => {
  const book = XLSX.read(fileBuffer);
  const sheet = book.Sheets[book.SheetNames[0]];
  const js = XLSX.utils.sheet_to_json(sheet);
  const data = js
    .filter((item) => {
      return item && item["Company Name"] && item["Website"] ? true : false;
    })
    .map((item, index) => {
      const account = item["Company Name"] || "";
      const website = item["Website"] || "";
      return {
        id: index + 1,
        account,
        website: validateUrl(website)
          ? website
          : validateUrl("https://" + website)
          ? "https://" + website
          : "",
        description: item["Company Description"] || "",
        accountLinkedIn: item["Company Linkedin URL"] || "",
        industry:
          typeof item["Industries"] === "string"
            ? item["Industries"].split(",")[0]
            : "",
        employees: item["Headcount"] || "",
        firstName: item["First Name"] || "",
        lastName: item["Last Name"] || "",
        title: item["Job Title"] || "",
        homePhone:
          typeof item["HQ"] === "string"
            ? item["HQ"]
                .split("\t")
                .map((substring) => substring.trim())
                .join("")
            : typeof item["Office"] === "string"
            ? item["Office"]
                .split("\t")
                .map((substring) => substring.trim())
                .join("")
            : "",
        workPhone:
          typeof item["Direct"] === "string"
            ? item["Direct"]
                .split("\t")
                .map((substring) => substring.trim())
                .join("")
            : "",
        mobilePhone:
          typeof item["Mobile"] === "string"
            ? item["Mobile"]
                .split("\t")
                .map((substring) => substring.trim())
                .join("")
            : "",
        email: item["Email"] || "",
        linkedIn: item["Personal Linkedin URL"] || "",
        country: item["Country"] || "",
        city: item["City"] || "",
        ownerEmail: config.outreachDefaultOwner,
      };
    })
    .filter((item) => validateUrl(item.website));
  return data;
};

const launchBrowser = async (headless, incognito) => {
  const options = {
    headless: headless === false ? false : true,
    incognito: incognito === true,
    args: ["--no-sandbox"],
  };
  const browser = await puppeteer.launch(options);
  return browser;
};

const getDomain = (page) => {
  return page
    .url()
    .replace("https://www.", "")
    .replace("http://www.", "")
    .replace("https://", "")
    .replace("http://", "")
    .split("/")[0];
};

const getRootUrl = (page) => {
  const domain = getDomain(page);
  return page.url().split(domain)[0] + domain;
};

const getCookies = async (page) => {
  return await page.cookies().then((cookies) => {
    return cookies.map((cookie) => {
      return { name: cookie.name.trim(), domain: cookie.domain.trim() };
    });
  });
};

const getCookieFlags = (cookies, domain) => {
  return config.cookieFlags
    .slice(0)
    .filter((flag) => {
      return flag.exactMatch
        ? cookies.some((cookie) => cookie.name === flag.name)
        : cookies.some((cookie) => {
            return cookie.name.includes(flag.name);
          });
    })
    .map((flag) => flag.label);
};

const getHrefAttribute = async (element, rootUrl) => {
  return await element
    .evaluate((el) => el.getAttribute("href"))
    .then((res) => {
      return res && typeof res === "string" ? res.trim() : "";
    })
    .then((res) => {
      return validateUrl(res)
        ? res
        : validateUrl(rootUrl + res)
        ? rootUrl + res
        : validateUrl(rootUrl + "/" + res)
        ? rootUrl + "/" + res
        : "";
    })
    .catch(() => "");
};

const getElementTextContent = async (element) => {
  return await element
    .evaluate((el) => el.textContent)
    .then((res) => {
      return res && typeof res === "string" ? res : "";
    })
    .catch(() => "");
};

const getPrivacyUrls = async (page, rootUrl) => {
  const urls = [];
  const links = await page.$$("a");
  for (const link of links) {
    const href = await getHrefAttribute(link, rootUrl).then((href) => {
      return href.split("?")[0].split("#")[0];
    });
    const hasKeyword = config.privacyUrlKeywords.some((keyword) => {
      return href.toLowerCase().includes(keyword.toLowerCase());
    });
    if (hasKeyword && !urls.includes(href)) {
      urls.push(href);
    }
  }
  return urls;
};

const getPrivacyFlags = async (page) => {
  const body = await page.$("body");
  const text = await getElementTextContent(body);
  return config.privacyFlags
    .slice(0)
    .filter((flag) => {
      if (flag.expected) {
        return flag.exactMatch
          ? flag.keywords.every((keyword) => !text.includes(keyword))
          : flag.keywords.some((keyword) => {
              return !text.toLowerCase().includes(keyword.toLowerCase());
            });
      } else {
        return flag.exactMatch
          ? flag.keywords.some((keyword) => text.includes(keyword))
          : flag.keywords.some((keyword) => {
              return text.toLowerCase().includes(keyword.toLowerCase());
            });
      }
    })
    .map((flag) => flag.label);
};

const createSheet = (xlsxBook, sheetName, columns, rows) => {
  const book = xlsxBook ? xlsxBook : XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  return book;
};

const bookToBuffer = (xlsxBook) => {
  return XLSX.write(xlsxBook, { type: "buffer" });
};

const writeFile = async (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, {}, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export default {
  wait,
  yyyymmdd,
  randomHash,
  jsonWebToken,
  validateUrl,
  readList,
  launchBrowser,
  getDomain,
  getRootUrl,
  getCookies,
  getCookieFlags,
  getHrefAttribute,
  getPrivacyUrls,
  getPrivacyFlags,
  createSheet,
  bookToBuffer,
  writeFile,
  deleteFile,
};
