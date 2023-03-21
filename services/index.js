import crypto from "crypto";
import puppeteer from "puppeteer";
import XLSX from "xlsx";

import config from "../config.js";

import jwt from "../utilities/jsonwebtoken.js";

const generateJSONWebToken = (timeToLiveSeconds) => {
  return jwt.sign({}, timeToLiveSeconds);
};

const validateUrl = (url) => {
  const regex =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  return regex.test(url);
};

const readWebsiteScanList = (fileBuffer) => {
  const book = XLSX.read(fileBuffer);
  const sheet = book.Sheets[book.SheetNames[0]];
  const js = XLSX.utils.sheet_to_json(sheet);
  const data = js
    .filter((item) => {
      return item["Account"] && item["Website"] ? true : false;
    })
    .map((item, index) => {
      const account = item["Account"];
      const website = item["Website"];
      return {
        id: index + 1,
        account,
        website: validateUrl(website) ? website : "https://" + website,
      };
    })
    .filter((item) => validateUrl(item.website));
  return data;
};

const launchBrowser = async (headless, incognito) => {
  const options = {
    headless: headless === false ? false : true,
    incognito: incognito === true,
  };
  const browser = await puppeteer.launch(options);
  return browser;
};

const getPageDomain = (page) => {
  return page
    .url()
    .replace("https://www.", "")
    .replace("http://www.", "")
    .replace("https://", "")
    .replace("http://", "")
    .split("/")[0];
};

const getPageRootUrl = (page) => {
  const domain = getPageDomain(page);
  return page.url().split(domain)[0] + domain;
};

const getPageCookies = async (page) => {
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

const getElementHrefAttribute = async (element, rootUrl) => {
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

const getPrivacyUrlsOnPage = async (page, rootUrl) => {
  const urls = [];
  const links = await page.$$("a");
  for (const link of links) {
    const href = await getElementHrefAttribute(link, rootUrl).then((href) => {
      return href.split("?")[0].split("#")[0];
    });
    console.log(href);
    const hasKeyword = config.privacyUrlKeywords.some((keyword) => {
      return href.toLowerCase().includes(keyword.toLowerCase());
    });
    if (hasKeyword && !urls.includes(href)) {
      urls.push(href);
    }
  }
  return urls;
};

const getPrivacyFlagsOnPage = async (page) => {
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

const createXlsxBook = () => {
  return XLSX.utils.book_new();
};

const addSheetToXlsxBook = (xlsxBook, sheetName, columns, rows) => {
  const book = xlsxBook ? xlsxBook : createXlsxBook();
  const sheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  return book;
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

const readFile = async () => {};

const writeXlsxFile = (xlsxBook, fileName) => {
  XLSX.writeFile(xlsxBook, fileName);
  return true;
};

export default {
  generateJSONWebToken,
  validateUrl,
  readWebsiteScanList,
  launchBrowser,
  getPageDomain,
  getPageRootUrl,
  getPageCookies,
  getCookieFlags,
  getElementHrefAttribute,
  getPrivacyUrlsOnPage,
  getElementHrefAttribute,
  getPrivacyFlagsOnPage,
  createXlsxBook,
  addSheetToXlsxBook,
  yyyymmdd,
  randomHash,
  writeXlsxFile,
};
