const axios = require("axios");

module.exports.config = {
  name: "nt",
  aliases: ["nteach"],
  version: "1.3.0",
  author: "MR᭄﹅ ALIHSAN SHOUROV﹅ メꪜ",
  countDown: 0,
  role: 0,
  description: "Random question or manual teach support with styled output",
  category: "chat",
  guide: {
    en: "{pn} → random question\n{pn} ask=question$ans=answer → manual teach"
  }
};

module.exports.onStart = async function ({ api, event, args }) {
  try {
    const text = args.join(" ").trim();

    // -----------------------------
    // Manual teach mode: ask=...$ans=...
    // -----------------------------
    if (text.startsWith("ask=") && text.includes("$ans=")) {
      const askMatch = text.match(/ask=(.*?)\$ans=(.*)/);
      if (!askMatch) return api.sendMessage("❌ Invalid format", event.threadID, event.messageID);

      const question = askMatch[1].trim();
      const answer = askMatch[2].trim();

      await axios.get(`https://mahabubxnirob-simisimi.onrender.com/teach?q=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}`);

      return api.sendMessage(
        `✅ Manually taught: "${answer}" for question "${question}"`,
        event.threadID,
        event.messageID
      );
    }

    // -----------------------------
    // Random question mode → fetch from API
    // -----------------------------
    const res = await axios.get("https://mahabubxnirob-simisimi.onrender.com/nt");
    const data = res.data;

    if (!data.question) return api.sendMessage("❌ No questions available yet", event.threadID, event.messageID);

    const message = `🧠 Here's Your Question:\n\n❝ ${data.question} ❞\n\n💬 Reply this message with your answer.\n📊 Answers available: ${data.answers_available} / Total teaches: ${data.total_teaches}`;

    api.sendMessage(message, event.threadID, (error, info) => {
      if (error) return console.log(error);

      // save for reply
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "teach",
        question: data.question
      });
    }, event.messageID);

  } catch (err) {
    console.log("NT ERROR:", err);
    api.sendMessage("❌ Something went wrong", event.threadID, event.messageID);
  }
};

module.exports.onReply = async function ({ api, event }) {
  try {
    // Ignore bot's own messages
    if ([api.getCurrentUserID()].includes(event.senderID)) return;

    const replyInfo = global.GoatBot.onReply.get(event.messageReply?.messageID);
    if (!replyInfo || replyInfo.type !== "teach") return;

    const answer = event.body?.trim();
    if (!answer) return;

    // Send answer to API
    await axios.get(`https://mahabubxnirob-simisimi.onrender.com/teach?q=${encodeURIComponent(replyInfo.question)}&ans=${encodeURIComponent(answer)}`);

    api.sendMessage(
      `✅ Learned: "${answer}" for question "${replyInfo.question}"`,
      event.threadID,
      event.messageID
    );

    // Clean up memory
    global.GoatBot.onReply.delete(event.messageReply.messageID);

  } catch (err) {
    console.log("NT REPLY ERROR:", err);
    api.sendMessage("❌ Failed to teach", event.threadID, event.messageID);
  }
};
