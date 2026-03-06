const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    version: "2.0.1",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    description: "Kiss someone by mention or reply 😘",
    category: "fun",
    guide: "{p}kiss @mention OR reply someone"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const { senderID } = event;

      let targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!targetID) {
        return message.reply("❌ Please mention or reply someone to kiss 😘");
      }

      const avatarURL1 = await usersData.getAvatarUrl(senderID);
      const avatarURL2 = await usersData.getAvatarUrl(targetID);

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://files.catbox.moe/6qg782.jpg");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(725, 250, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar1, 640, 170, 170, 170);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 370, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar2, 90, 280, 170, 170);
      ctx.restore();

      const outputPath = path.join(__dirname, "kiss.png");
      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(outputPath, buffer);

      message.reply(
        {
          body: "Ummmmaaaaahhh! 😽😘",
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );

    } catch (error) {
      console.error(error);
      message.reply("⚠️ Something went wrong. Try again later.");
    }
  }
};