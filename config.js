import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

config();

export default {
  // Application directory
  dirname: dirname(fileURLToPath(import.meta.url)),
  // Runtime variables
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  // Secret keys for authentication
  cookieSecret: process.env.COOKIE_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  // Administrator authentication
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  outreachDefaultOwner: process.env.OUTREACH_DEFAULT_OWNER,

  // Flagged cookies for website scans. You can customize this by adding or removing items following the following format:
  cookieFlags: [
    {
      name: "_ga",
      exactMatch: true,
      expected: false,
      label: "Google Analytics",
      fullLabel: 'Is the "_ga" Google Analytics cookie activated by default?',
    },
    {
      name: "hubspotutk",
      exactMatch: true,
      expected: false,
      label: "HubSpot",
      fullLabel: 'Is the "hubspotuk" HubSpot cookie activated by default?',
    },
  ],
  // Keywords to parse pages for privacy-related URLs
  privacyUrlKeywords: [
    "datenschutz",
    "privacy",
    "data-privacy",
    "data-protection",
    "datensicherheit",
    "dsgvo",
    "gdpr",
  ],
  // Flagged privacy issues for website scans
  privacyFlags: [
    {
      keywords: [
        "Datenschutzbeauftragter",
        "Datenschutzbeauftragte",
        "Datenschutzbeauftragte/r",
        "Beauftragte für den Datenschutz",
        "Beauftragter für den Datenschutz",
        "Beauftragte/r für den Datenschutz",
        "Beauftragte für Datenschutz",
        "Beauftragter für Datenschutz",
        "Beauftragte/r für Datenschutz",
        "Data Privacy Officer",
        "Data Protection Officer",
      ],
      exactMatch: true,
      expected: true,
      label: "No DPO",
      fullLabel: "Is a Data Protection Officer listed?",
    },
    {
      keywords: ["Privacy Shield"],
      exactMatch: true,
      expected: false,
      label: "EU-US Privacy Shield",
      fullLabel: "Is the EU-US Privacy Shield mentioned?",
    },
    {
      keywords: ["Google Analytics"],
      exactMatch: true,
      expected: false,
      label: "Google Analytics",
      fullLabel: "Is Google Analytics mentioned?",
    },
  ],
};
