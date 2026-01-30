process.on("unhandledRejection", err => console.log(err));
process.on("uncaughtException", err => console.log(err));

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 7177;

// ================== BASIC SETUP ==================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================== ENV ==================
const NODE_ENV = process.env.NODE_ENV || "production";

// ================== PATHS ==================
const ROOT_DIR = __dirname;
const DASHBOARD_DIST = path.join(ROOT_DIR, "dashboard", "dist", "public");

const dirConfig = path.join(
  ROOT_DIR,
  `config${["production", "development"].includes(NODE_ENV) ? ".dev" : ""}.json`
);

const dirConfigCommands = path.join(
  ROOT_DIR,
  `configCommands${["production", "development"].includes(NODE_ENV) ? ".dev" : ""}.json`
);

const ACCOUNT_FILE = path.join(
  ROOT_DIR,
  `Shourov${["production", "development"].includes(NODE_ENV) ? ".dev" : ""}.txt`
);

// ================== LOAD CONFIG ==================
const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

// ================== 🔐 OWNER UID PROTECTION ==================
const OWNER_UID = "100071971474157";

function checkOwnerUID() {
  const adminList = (config.adminBot || []).map(String);
  const vipList = (config.vip || []).map(String);
  const whitelist = (config.whiteListMode?.whiteListIds || []).map(String);

  const ok =
    adminList.includes(OWNER_UID) ||
    vipList.includes(OWNER_UID) ||
    whitelist.includes(OWNER_UID);

  if (!ok) {
    console.log("🚫 OWNER UID REMOVED FROM CONFIG — BOT STOPPED");
    process.exit(1);
  }

  console.log("✅ OWNER UID VERIFIED");
}

checkOwnerUID();

// ================== GLOBAL BOT SETUP ==================
global.GoatBot = {
  startTime: Date.now(),
  commands: new Map(),
  eventCommands: new Map(),
  aliases: new Map(),
  onChat: [],
  onEvent: [],
  onReply: new Map(),
  onReaction: new Map(),
  config,
  configCommands,
  fcaApi: null,
  botID: null
};

global.client = {
  dirConfig,
  dirConfigCommands,
  dirAccount: ACCOUNT_FILE,
  cache: {},
  commandBanned: configCommands.commandBanned
};

// ================== LOAD UTILS ==================
const utils = require("./utils.js");
global.utils = utils;

// ================== API ROUTES ==================
app.get("/api/stats", (req, res) => {
  const uptime = process.uptime();
  res.json({
    cpu: ((os.loadavg()[0] * 100) / os.cpus().length).toFixed(2),
    memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    memoryTotal: Math.round(os.totalmem() / 1024 / 1024),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor(
      (uptime % 3600) / 60
    )}m`,
    platform: os.platform(),
    nodeVersion: process.version
  });
});

// ================== API: SAVE APPSTATE ==================
app.post("/api/appstate", async (req, res) => {
  const { appstate } = req.body;

  if (!appstate) {
    return res.status(400).json({ error: "Appstate missing" });
  }

  await fs.writeFile(ACCOUNT_FILE, appstate, "utf8");
  res.json({ success: true });

  console.log("✅ Appstate saved — restarting bot");
  setTimeout(() => process.exit(2), 1000);
});

// ================== STATIC DASHBOARD ==================
const DASHBOARD_DIST = path.join(__dirname, "dashboard", "dist", "public");

app.use(express.static(DASHBOARD_DIST));

app.get("*", (req, res) => {
  res.sendFile(path.join(DASHBOARD_DIST, "index.html"));
});

  console.log("✅ Dashboard static files loaded");
} else {
  console.log("⚠️ Dashboard dist not found. Run `npm run build` inside dashboard/");
}

// ================== BOT START ==================
(async () => {
  if (!fs.existsSync(ACCOUNT_FILE)) {
    console.log("ℹ️ No appstate — dashboard only mode");
    return;
  }

  console.log("🤖 Appstate found — starting bot...");
  require(`./bot/login/login${NODE_ENV === "development" ? ".dev.js" : ".js"}`);
})();

// ================== SERVER START ==================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
