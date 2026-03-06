const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "3.0",
    author: "Shourov",
    countDown: 5,
    role: 0,
    description: "UID animated banner",
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

      const width = 800;
      const height = 400;

      const encoder = new GIFEncoder(width, height);
      const tmpDir = path.join(__dirname, "tmp");

      if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `uid_${Date.now()}.gif`);

      const stream = encoder.createWriteStream().pipe(fs.createWriteStream(filePath));

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(80);
      encoder.setQuality(10);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const avatar = await loadImage(avatarURL);

      for (let i = 0; i < 20; i++) {

        // background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);

        // pulse glow circle
        const radius = 100 + Math.sin(i * 0.3) * 20;

        ctx.beginPath();
        ctx.arc(200, 200, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 8;
        ctx.stroke();

        // avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(200, 200, 90, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 110, 110, 180, 180);
        ctx.restore();

        // moving text
        const move = Math.sin(i * 0.4) * 20;

        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name, 400 + move, 180);

        ctx.font = "bold 26px Arial";
        ctx.fillStyle = "#00ff00";
        ctx.fillText(`UID: ${targetID}`, 400 + move, 230);

        ctx.font = "24px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`facebook.com/${targetID}`, 400 + move, 280);

        encoder.addFrame(ctx);
      }

      encoder.finish();

      return message.reply(
        {
          body:
            `👤 Name: ${name}\n` +
            `🆔 UID: ${targetID}\n` +
            `🔗 https://facebook.com/${targetID}`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.log("UID ERROR:", err);
      return message.reply("❌ UID animation failed.");
    }

  }
};