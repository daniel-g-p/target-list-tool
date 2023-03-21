import config from "../config.js";

import service from "../services/index.js";

export default (io) => {
  // Scan websites
  io.listen("scan-websites/upload", async (fileBuffer) => {
    // Read list of accounts
    console.log(fileBuffer);
    const list = service.readWebsiteScanList(fileBuffer);
    if (list.length > 0) {
      io.emit("scan-websites/ok/accepted", list.length);
    } else {
      io.emit("scan-websites/error/no-accounts");
      return;
    }
    // Launch browser
    const browser = await service.launchBrowser(true, true);
    const page = await browser.newPage();
    // Scan websites
    for (let i = 0; i < list.length; i++) {
      try {
        const item = list[i];

        await page.goto(item.website);
        // Scan for cookie issues
        const domain = service.getPageDomain(page);
        const cookies = await service.getPageCookies(page);
        const cookieFlags = service
          .getCookieFlags(cookies, domain)
          .map((flag) => "Cookies: " + flag);
        const thirdPartyCookies = cookies.some((cookie) => {
          return !cookie.domain.includes(domain);
        });
        if (thirdPartyCookies) {
          cookieFlags.push("Cookies: Third Party Cookies");
        }
        // Scan for privacy issues
        const rootUrl = service.getPageRootUrl(page);
        const privacyUrls = await service.getPrivacyUrlsOnPage(page, rootUrl);
        const privacyFlags = [];
        for (const url of privacyUrls) {
          const flags = await page
            .goto(url)
            .then(() => {
              return service.getPrivacyFlagsOnPage(page);
            })
            .then((flags) => {
              return flags.map((flag) => "Privacy: " + flag);
            })
            .catch((error) => {
              console.log(error);
              return [];
            });
          for (const flag of flags) {
            if (!privacyFlags.includes(flag)) {
              privacyFlags.push(flag);
            }
          }
        }
        // Save scan result
        item.checkedUrls = privacyUrls.length;
        item.flags = [...cookieFlags, ...privacyFlags];
        // Send progress update
        io.emit("scan-websites/ok/progress", i + 1);
      } catch (error) {
        console.log(error);
      }
    }
    // Close browser
    await browser.close();
    // Create output as XLSX file
    const columns = [
      "ID",
      "Account",
      "Website",
      "Privacy: Checked URLs",
      ...config.privacyFlags.map((flag) => "Privacy: " + flag.label),
      "Cookies: Third Party Cookies",
      ...config.cookieFlags.map((flag) => "Cookies: " + flag.label),
    ];
    const rows = list.map((item) => {
      return [
        item.id,
        item.account,
        item.website,
        item.checkedUrls,
        ...columns
          .slice(4)
          .map((column) => (item.flags.includes(column) ? "x" : "")),
      ];
    });
    const workbook = service.addSheetToXlsxBook(null, "Sheet1", columns, rows);
    // Send XLSX file name to client for download
    const fileName = service.yyyymmdd() + "-" + service.randomHash();
    const filePath = config.dirname + "/output/" + fileName + ".xlsx";
    service.writeXlsxFile(workbook, filePath);
    io.emit("scan-websites/ok/result", fileName);
  });
};
