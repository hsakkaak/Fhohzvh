const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "marry2",
    aliases: ["m"],
    version: "3.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}marry2 @mention OR reply OR UID"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const one = event.senderID;

      // ===== TARGET SYSTEM =====
      let two =
        event.messageReply?.senderID ||         // Reply
        Object.keys(event.mentions || {})[0] || // Mention
        args[0];                                // UID

      if (!two)
        return message.reply("💍 Please mention / reply / UID!");

      const imagePath = await createImage(one, two);

      message.reply(
        {
          body: "「 Love you Babe 🥰❤️ 」",
          attachment: fs.createReadStream(imagePath)
        },
        () => fs.unlinkSync(imagePath)
      );

    } catch (err) {
      console.log("MARRY2 ERROR:", err);
      message.reply("⚠️ Marry2 command error.");
    }
  }
};


// ===== IMAGE FUNCTION =====
async function createImage(one, two) {

  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const outputPath = path.join(tmpDir, `marry2_${Date.now()}.png`);

  // ===== Avatar =====
  const avone = await jimp.read(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  );

  const avtwo = await jimp.read(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  );

  avone.circle();
  avtwo.circle();

  const background = await jimp.read(
    "https://i.ibb.co/5TwSHpP/Guardian-Place-full-1484178.jpg"
  );

  background
    .resize(600, 338)
    .composite(avone.resize(90, 90), 250, 10)
    .composite(avtwo.resize(90, 90), 350, 80);

  await background.writeAsync(outputPath);

  return outputPath;
}