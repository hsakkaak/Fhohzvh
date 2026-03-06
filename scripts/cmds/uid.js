const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "3.1",
    author: "Shourov Fix",
    countDown: 5,
    role: 0,
    category: "info",
    guide: "{p}uid @mention | reply"
  },

  onStart: async function ({ message, event, usersData }) {

    try {

      let targetID =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      const name = await usersData.getName(targetID);
      const avatarURL = await usersData.getAvatarUrl(targetID);

      const width = 700;
      const height = 350;

      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache))
        fs.mkdirSync(cache, { recursive: true });

      const filePath = path.join(cache, `uid_${Date.now()}.gif`);

      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(filePath);

      encoder.createReadStream().pipe(writeStream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(90);
      encoder.setQuality(10);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const avatar = await loadImage(avatarURL);

      for (let i = 0; i < 18; i++) {

        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, width, height);

        const pulse = 90 + Math.sin(i * 0.4) * 15;

        ctx.beginPath();
        ctx.arc(150, 175, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 175, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 70, 95, 160, 160);
        ctx.restore();

        const move = Math.sin(i * 0.3) * 15;

        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name, 320 + move, 150);

        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "#00ff00";
        ctx.fillText(`UID: ${targetID}`, 320 + move, 190);

        ctx.font = "22px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`facebook.com/${targetID}`, 320 + move, 230);

        encoder.addFrame(ctx);
      }

      encoder.finish();

      writeStream.on("finish", () => {

        message.reply(
          {
            body:
              `👤 Name: ${name}\n` +
              `🆔 UID: ${targetID}\n` +
              `🔗 https://facebook.com/${targetID}`,
            attachment: fs.createReadStream(filePath)
          },
          () => fs.unlinkSync(filePath)
        );

      });

    } catch (err) {

      console.log("UID ERROR:", err);
      message.reply("❌ UID animation failed.");

    }

  }
};