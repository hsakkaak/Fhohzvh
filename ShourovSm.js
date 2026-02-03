process.on("unhandledRejection", err => console.log(err));
process.on("uncaughtException", err => console.log(err));

const path = require("path");
const fs = require("fs-extra");
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 7177;

// ================= BASIC MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// ================= PUBLIC PAGES (NO LOGIN) =================
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

// ================= CONFIG PATH =================
const dirConfig = path.join(__dirname, "config.json");
const dirConfigCommands = path.join(__dirname, "configCommands.json");
const dirAccount = path.join(__dirname, "Shourov.txt");

if (!fs.existsSync(dirConfig)) fs.writeJsonSync(dirConfig, {});
if (!fs.existsSync(dirConfigCommands)) fs.writeJsonSync(dirConfigCommands, {});

// ================= GLOBAL BOT OBJECT =================
global.GoatBot = {
  startTime: Date.now(),
  commands: new Map(),
  eventCommands: new Map(),
  config: require(dirConfig),
  configCommands: require(dirConfigCommands),
  fcaApi: null,
  botID: null
};

global.db = {
  allThreadData: [],
  allUserData: []
};

// ================= API =================
app.get("/api/stats", (req, res) => {
  const os = require("os");
  const uptime = process.uptime();

  res.json({
    cpu: (os.loadavg()[0] * 100 / (os.cpus().length || 1)).toFixed(2),
    memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    nodeVersion: process.version
  });
});

app.get("/api/commands", (req, res) => {
  const cmds = [...global.GoatBot.commands.keys()];
  res.json(cmds.map(c => ({ name: c, enabled: true })));
});

app.post("/api/control", (req, res) => {
  const { action } = req.body;

  if (action === "restart") {
    res.json({ message: "Restarting bot..." });
    setTimeout(() => process.exit(2), 1000);
  }

  if (action === "stop") {
    res.json({ message: "Bot stopped." });
    process.exit(0);
  }

  res.json({ message: "Bot already running." });
});

app.post("/api/appstate", (req, res) => {
  const { appstate } = req.body;
  if (!appstate) return res.status(400).json({ error: "Appstate missing" });

  fs.writeFileSync(dirAccount, appstate, "utf8");
  res.json({ success: true });

  setTimeout(() => process.exit(2), 1000);
});

app.get("/api/logs", (req, res) => {
  try {
    const logData = fs.readFileSync("./logs/latest.log", "utf8");
    res.send(logData);
  } catch {
    res.send("[INFO] Bot running...\n[OK] No logs found");
  }
});

app.post("/api/test-chat", (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "❌ Empty message" });

  res.json({ reply: "Bot received: " + message });
});

// ================= START BOT CORE =================
(async () => {
  console.log("[SYSTEM] Starting GoatBot (No Login Mode)");

  try {
    require("./bot/login/login.js");
  } catch (e) {
    console.log("Login module skipped or failed safely");
  }
})();

// ================= SERVER LISTEN =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Running on port ${PORT}`);
});