const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "5.1.2",
    author: "Alihsan Shourov (Name Edition)",
    countDown: 5,
    role: 0,
    description: "Fake hack banner with name only",
    category: "fun",
    guide: "{p}hack @mention | reply | uid"
  },

  onStart: async function ({ message, event, args, usersData }) {
    try {
      const senderID = event.senderID;

      // ===== TARGET DETECT =====
      let targetID;

      if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      } else if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions || {}).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else {
        targetID = senderID;
      }

      // ===== USER INFO =====
      const userName = await usersData.getName(targetID);
      const avatarURL = await usersData.getAvatarUrl(targetID);

      // ===== BACKGROUND =====
      const background = await loadImage(
        "https://files.catbox.moe/ibmk54.jpg"
      );

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const avatar = await loadImage(avatarURL);

      // ===== AVATAR POSITION =====
      const avatarSize = 170;
      const avatarX = 120;
      const avatarY = 95;

      ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      // Border
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#00ff00";
      ctx.strokeRect(
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      // ===== TEXT =====
      ctx.textAlign = "left";

      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.fillText(
        "SYSTEM BREACHED",
        avatarX + avatarSize + 80,
        200
      );

      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        userName,
        avatarX + avatarSize + 80,
        260
      );

      // ===== SAVE FILE =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(
        tmpDir,
        `hack_${Date.now()}.png`
      );

      fs.writeFileSync(
        filePath,
        canvas.toBuffer("image/png")
      );

      return message.reply(
        {
          body:
            "💻 SYSTEM BREACHED!\n\n" +
            `🔓 ${userName} hacked successfully!\n\n` +
            "⚠️ Just kidding 😎",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("HACK ERROR:", err);
      return message.reply("❌ Hack command failed.");
    }
  }
};