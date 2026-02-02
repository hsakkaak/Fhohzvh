process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const google = require("googleapis").google;
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();

// Replit / Render port
const port = process.env.PORT || 7177;
const { execSync } = require('child_process');
const log = require('./logger/log.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// ===================== ROUTES (NO LOGIN) =====================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/command.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/command.html"));
});

app.get("/settings.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/settings.html"));
});

app.get("/control.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/control.html"));
});

app.get("/logs.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/logs.html"));
});

app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/chat.html"));
});

app.get("/appstate.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/appstate.html"));
});

// ===================== STATIC FILES =====================

app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// ===================== CONFIG CHECK =====================

function validJSON(pathDir) {
  if (!fs.existsSync(pathDir))
    throw new Error(`File "${pathDir}" not found`);
  execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
  return true;
}

const { NODE_ENV } = process.env;
const dirConfig = path.join(__dirname, "config.json");
const dirConfigCommands = path.join(__dirname, "configCommands.json");
const dirAccount = path.join(__dirname, "Shourov.txt");

for (const p of [dirConfig, dirConfigCommands]) {
  try {
    validJSON(p);
  } catch (e) {
    log.error("CONFIG", e.message);
    process.exit(1);
  }
}

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

// ===================== GLOBAL BOT =====================

global.GoatBot = {
  startTime: Date.now(),
  commands: new Map(),
  aliases: new Map(),
  onReply: new Map(),
  onReaction: new Map(),
  onEvent: [],
  onAnyEvent: [],
  config,
  configCommands,
  fcaApi: null,
  botID: null
};

global.db = {
  allThreadData: [],
  allUserData: []
};

global.client = {
  dirConfig,
  dirConfigCommands,
  dirAccount,
  cache: {}
};

const utils = require("./utils.js");
global.utils = utils;

// ===================== START BOT LOGIN =====================

(async () => {
  try {
    console.log("[SYSTEM] Starting bot...");
    require("./bot/login/login.js");
  } catch (e) {
    console.log("Login init error:", e.message);
  }
})();

// ===================== API =====================

app.post("/api/command-toggle", (req, res) => {
  const { command, enable } = req.body;
  const cfg = JSON.parse(fs.readFileSync(dirConfig, "utf8"));

  cfg.disabledCommands ||= [];

  if (!enable) {
    if (!cfg.disabledCommands.includes(command))
      cfg.disabledCommands.push(command);
  } else {
    cfg.disabledCommands = cfg.disabledCommands.filter(c => c !== command);
  }

  fs.writeFileSync(dirConfig, JSON.stringify(cfg, null, 2));
  res.json({ success: true });
});

app.get("/api/stats", (req, res) => {
  const os = require("os");
  res.json({
    cpu: (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2),
    memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    uptime: Math.floor(process.uptime() / 60) + " min",
    nodeVersion: process.version
  });
});

app.post("/api/appstate", (req, res) => {
  const { appstate } = req.body;
  if (!appstate) return res.status(400).json({ error: "Missing appstate" });

  fs.writeFileSync(dirAccount, appstate, "utf8");
  res.json({ success: true });
  setTimeout(() => process.exit(2), 1000);
});

app.get("/api/logs", (req, res) => {
  try {
    res.send(fs.readFileSync("./logs/latest.log", "utf8"));
  } catch {
    res.send("Bot running...");
  }
});

app.get("/api/botinfo", (req, res) => {
  res.json({
    groups: global.db.allThreadData.length,
    users: global.db.allUserData.length,
    commands: global.GoatBot.commands.size,
    time: new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })
  });
});

// ===================== LISTEN =====================

app.listen(port, "0.0.0.0", () => {
  console.log(`[SERVER] Running on port ${port}`);
});