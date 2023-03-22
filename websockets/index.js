import config from "../config.js";

import service from "../services/index.js";

export default (io) => {
  // Scan websites
  io.listen("upload-list", async (fileBuffer) => {
    // Read list of accounts
    const list = service.readList(fileBuffer);
    if (list.length > 0) {
      io.emit("list-accepted", list.length);
    } else {
      io.emit("no-accounts");
      return;
    }
    const accountNames = list.reduce((result, item) => {
      if (!result.includes(item.account)) {
        result.push(item.account);
      }
      return result;
    }, []);

    // Launch browser
    const browser = await service.launchBrowser(true, true);
    const page = await browser.newPage();

    // Scan websites
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      try {
        await page.goto(item.website);

        // Scan for cookie issues
        const domain = service.getDomain(page);
        const cookies = await service.getCookies(page);
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
        const rootUrl = service.getRootUrl(page);
        const privacyUrls = await service.getPrivacyUrls(page, rootUrl);
        const privacyFlags = [];
        for (const url of privacyUrls) {
          const flags = await page
            .goto(url)
            .then(() => {
              return service.getPrivacyFlags(page);
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
      } catch (error) {
        item.checkedUrls = [];
        item.flags = ["Website scan failed"];
        console.log(error);
      }
      io.emit("update-progress", i + 1);
    }

    // Close browser
    await browser.close();

    // Create output as XLSX file
    const accountColumns = [
      "Name",
      "Website",
      "Description",
      "LinkedIn URL",
      "Industry",
      "Employees",
      "Owner email",
      "Website scan failed",
      "Privacy: Checked URLs",
      ...config.privacyFlags.map((flag) => "Privacy: " + flag.label),
      "Cookies: Third Party Cookies",
      ...config.cookieFlags.map((flag) => "Cookies: " + flag.label),
    ];
    const accountRows = accountNames.map((accountName) => {
      const item = list.find((item) => item.account === accountName);
      return [
        item.account,
        item.website,
        item.description,
        item.accountLinkedIn,
        item.industry,
        item.employees,
        item.ownerEmail,
        item.checkedUrls,
        ...accountColumns
          .slice(8)
          .map((column) => (item.flags.includes(column) ? "x" : "")),
      ];
    });
    const prospectColumns = [
      "Account name",
      "Account",
      "First name",
      "Last name",
      "Title",
      "Home phone",
      "Work phone",
      "Mobile phone",
      "Email",
      "LinkedIn",
      "Country",
      "City",
      "Notes",
      "Website",
      "Company industry",
      "Company LinkedIn",
      "Owner email",
      "Website scan failed",
      "Privacy: Checked URLs",
      ...config.privacyFlags.map((flag) => "Privacy: " + flag.label),
      "Cookies: Third Party Cookies",
      ...config.cookieFlags.map((flag) => "Cookies: " + flag.label),
    ];
    const prospectRows = list.map((item) => {
      return [
        item.account,
        item.account,
        item.firstName,
        item.lastName,
        item.title,
        item.homePhone,
        item.workPhone,
        item.mobilePhone,
        item.email,
        item.linkedIn,
        item.country,
        item.city,
        item.flags.join(", "),
        item.website,
        item.industry,
        item.accountLinkedIn,
        item.ownerEmail,
        item.checkedUrls,
        ...prospectColumns
          .slice(18)
          .map((column) => (item.flags.includes(column) ? "X" : "")),
      ];
    });
    const accountWorkbook = service.createSheet(
      null,
      "Accounts",
      accountColumns,
      accountRows
    );
    const prospectWorkbook = service.createSheet(
      accountWorkbook,
      "Prospects",
      prospectColumns,
      prospectRows
    );

    // Send XLSX file name to client for download
    const fileName = service.yyyymmdd() + "-" + service.randomHash();
    const filePath = config.dirname + "/output/" + fileName + ".xlsx";
    const fileData = await service.bookToBuffer(prospectWorkbook);
    const fileWritten = await service
      .writeFile(filePath, fileData)
      .then(() => true)
      .catch((error) => {
        console.log(error);
        return false;
      });
    if (fileWritten) {
      io.emit("result-ready", fileName);
    } else {
      io.emit("write-failed");
    }
  });
};
