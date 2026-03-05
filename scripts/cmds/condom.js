const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "condom",
    version: "2.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Make fun of your friends",
    longDescription: "Make fun meme with profile picture",
    category: "fun",
    guide: "{pn} @mention | reply | UID"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const { senderID } = event;
      let targetID;

      // ===== Reply Support =====
      if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      }

      // ===== Mention Support =====
      if (!targetID && Object.keys(event.mentions || {}).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      // ===== UID Support =====
      if (!targetID && args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }

      if (!targetID) {
        return message.reply("❌ Please reply, mention or provide UID.");
      }

      // ===== Get Avatar =====
      const avatar = await jimp.read(
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      const background = await jimp.read(
        "https://i.imgur.com/cLEixM0.jpg"
      );

      background
        .resize(512, 512)
        .composite(avatar.resize(263, 263), 256, 258);

      // ===== Save Temp File =====
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `condom_${Date.now()}.png`);
      await background.writeAsync(filePath);

      await message.reply(
        {
          body: "😆 Ops Crazy Condom Fails!",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (error) {
      console.error("CONDOM ERROR:", error);
      message.reply("❌ Failed to generate image.");
    }
  }
};