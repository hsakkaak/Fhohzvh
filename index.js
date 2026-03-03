const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Web server running on port ${PORT}`);
});

function startBot(accountFileName) {
  const env = { ...process.env, ACCOUNT_FILE: accountFileName };
  const child = spawn("node", ["Shourov.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: { ...env, NODE_OPTIONS: "--trace-warnings" }
  });

  child.on("close", (code) => {
    if (code === 2) {
      console.log(`[${accountFileName}] Bot exited with code 2. Restarting...`);
      startBot(accountFileName);
    } else {
      console.log(`[${accountFileName}] Bot exited with code ${code}`);
    }
  });
}

startBot("Shourov.dev.txt");
