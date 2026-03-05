const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "marry",
    version: "3.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}marry @mention OR reply OR UID"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const one = event.senderID;

      // ===== TARGET SYSTEM =====
      let two =
        event.messageReply?.senderID ||                // Reply
        Object.keys(event.mentions || {})[0] ||        // Mention
        args[0];                                       // UID

      if (!two)
        return message.reply("💍 Mention / Reply / UID দাও যাকে marry করবে!");

      const imagePath = await createMarriageImage(one, two);

      message.reply(
        {
          body: `💖 Married Successfully 💍\n\nUID: ${two}`,
          attachment: fs.createReadStream(imagePath)
        },
        () => fs.unlinkSync(imagePath)
      );

    } catch (err) {
      console.log("MARRY ERROR:", err);
      message.reply("⚠️ Marry command error.");
    }
  }
};


// ===== IMAGE FUNCTION =====
async function createMarriageImage(one, two) {

  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const outputPath = path.join(tmpDir, `marry_${Date.now()}.png`);

  // ===== Get Avatar From Graph =====
  const avone = await jimp.read(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  );

  const avtwo = await jimp.read(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  );

  avone.circle();
  avtwo.circle();

  const background = await jimp.read("https://i.imgur.com/qyn1vO1.jpg");

  background.resize(432, 280)
    .composite(avone.resize(80, 80), 180, 10)
    .composite(avtwo.resize(80, 80), 120, 25);

  await background.writeAsync(outputPath);

  return outputPath;
}