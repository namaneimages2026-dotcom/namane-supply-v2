export const services = [
  "Leather tags / patches / labels",
  "Acrylic signage",
  "MDF / plywood signage",
  "Trophies and awards",
  "Corporate gifts",
  "Event branding",
  "Decor and wall art",
  "Prototyping and short-run production",
  "Educational laser demos"
];

export const supportedMaterials = [
  "MDF",
  "Plywood",
  "Acrylic",
  "Leather",
  "Paper / cardboard",
  "Fabric",
  "Glass engraving only",
  "Slate engraving"
];

export const unsupportedMaterials = ["Metal cutting", "Fiber laser", "CNC routing", "UV printing"];

export const pricingRules = {
  retailMinimum: 250,
  b2bMinimum: 500,
  setupLow: 150,
  setupHigh: 350,
  customDesignHourly: 350,
  machineHourly: 350
};

export const educationTopics = [
  "What is CO2 laser cutting?",
  "Difference between cutting and engraving",
  "Why vector files matter",
  "Materials and thickness",
  "Power, speed, focus, and air assist",
  "Safety basics",
  "Fire risk and supervision",
  "Ventilation and smoke extraction",
  "Why some materials should not be laser cut",
  "Maintenance: lens, mirrors, alignment, chiller, air assist, focus"
];

export const simulationJobs = [
  { title: "Leather brand tag order", material: "Leather", idealPower: 42, idealSpeed: 55, idealFocus: 0, minPrice: 1200 },
  { title: "Acrylic sign", material: "Acrylic", idealPower: 64, idealSpeed: 28, idealFocus: 0, minPrice: 1800 },
  { title: "MDF wall art", material: "MDF", idealPower: 58, idealSpeed: 32, idealFocus: 0, minPrice: 1500 },
  { title: "Trophy engraving plate", material: "Acrylic", idealPower: 34, idealSpeed: 72, idealFocus: -1, minPrice: 950 },
  { title: "Troubleshooting poor cutting power", material: "MDF", idealPower: 66, idealSpeed: 24, idealFocus: 0, minPrice: 1300 }
];

export const automationFlow = [
  "Scan QR / visit site",
  "Learn what laser cutting can do",
  "Select product type",
  "Submit quote details",
  "Artwork check",
  "Deposit required",
  "Production scheduled",
  "Cutting / engraving",
  "Quality check",
  "Collection / delivery",
  "Follow-up / repeat order"
];

export const automationConnectors = [
  "Gmail: quote confirmation + follow-up",
  "Google Drive: artwork and job files",
  "Airtable: job tracking database",
  "Google Calendar: production scheduling",
  "Canva: campaign/poster assets",
  "PayPal / Stripe: deposit payments",
  "WhatsApp: customer updates",
  "GitHub: app source control"
];
