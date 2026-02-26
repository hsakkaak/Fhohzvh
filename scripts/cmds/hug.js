const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "hug",
    version: "1.1.1",
    author: "Rakib Adil",
    countDown: 5,
    role: 0,
    longDescription: "{p}hug @mention someone you want to hug that person 🫂",
    category: "funny",
    guide: "{p}hug and mention someone you want to hug 🥴",
    usePrefix: true,
    premium: false,
    notes: "If you change the author then the command will not work and not usable"
  },

  onStart: async function ({ api, message, event }) {
    const config = module.exports.config;
    const eAuth = "UmFraWIgQWRpbA==";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");

    if (config.author !== dAuth) {
      return message.reply(
        "⚠️ Command author mismatch. Please restore original author name to use this command."
      );
    }

    const one = event.senderID;

    let two;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      two = Object.keys(event.mentions)[0];
    } else {
      return message.reply("please mention someone to hug 🫂");
    }

    try {
      const avatar1Data = (
        await axios.get(
          `https://graph.facebook.com/${one}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avatar2Data = (
        await axios.get(
          `https://graph.facebook.com/${two}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avatar1 = await loadImage(avatar1Data);
      const avatar2 = await loadImage(avatar2Data);

      const canvas = createCanvas(800, 750);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(
        "https://files.catbox.moe/qxovn9.jpg"
      );
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(610, 340, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 525, 255, 170, 170);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(230, 350, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 145, 265, 170, 170);
      ctx.restore();

      const outputPath = `${__dirname}/tmp/hug_image.png`;
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: "🫂 A warm hug 💞",
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "⚠️ An error occurred, try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};