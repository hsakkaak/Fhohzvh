const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  return "https://mahabubxnirob-simisimi.onrender.com";
};

module.exports.config = {
  name: "janu",
  aliases: ["jan"],
  version: "1.0.0",
  author: "MR᭄﹅ ALIHSAN SHOUROV﹅ メꪜ",
  countDown: 0,
  role: 0,
  description: "Janu Simisimi Chat",
  category: "chat",
  guide: {
    en: "{pn} hi / hello / anything"
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  try {
    const text = args.join(" ").toLowerCase();
    if (!text) {
      return api.sendMessage(
        "🫶 Janu ki bolbo?",
        event.threadID,
        event.messageID
      );
    }

    const res = await axios.get(
      `${await baseApiUrl()}/ask?q=${encodeURIComponent(text)}`
    );

    const reply = res.data?.reply || "আমি এটা জানি না 🥲";
    await api.sendMessage(reply, event.threadID, event.messageID);

    // ❌ Unknown question → save to temp/q.json
    if (reply === "আমি এটা জানি না 🥲") {
      const tempDir = path.join(process.cwd(), "temp");
      const filePath = path.join(tempDir, "q.json");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      let data = {};
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        data = raw ? JSON.parse(raw) : {};
      }

      const key = "question" + (Object.keys(data).length + 1);
      data[key] = text;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

  } catch (err) {
    console.log("JANU ERROR:", err);
    api.sendMessage(
      "❌ Janu ekhon busy ache 🥲",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body?.toLowerCase();
    if (!body) return;

    if (
      body.startsWith("janu") ||
      body.startsWith("jan")
    ) {
      const msg = body.replace(/^\S+\s*/, "");
      if (!msg) {
        return api.sendMessage(
          "😚 Haan janu bollo?",
          event.threadID,
          event.messageID
        );
      }

      const res = await axios.get(
        `${await baseApiUrl()}/ask?q=${encodeURIComponent(msg)}`
      );

      const reply = res.data?.reply || "আমি এটা জানি না 🥲";
      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (e) {
    console.log(e);
  }
};
