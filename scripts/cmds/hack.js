const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "5.1.0",
    author: "Alihsan Shourov (UID Edition)",
    countDown: 5,
    role: 0,
    description: "Fake hack banner with UID support",
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

      // ===== LOAD BACKGROUND =====
      const background = await loadImage("https://files.catbox.moe/ibmk54.jpg");

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const avatar = await loadImage(avatarURL);

      // ===============================
      // 🔥 SQUARE AVATAR LEFT SIDE
      // ===============================

      const avatarSize = 200;     // ছোট করার জন্য
      const avatarX = 80;         // বাম দিকে সরানো
      const avatarY = 120;        // উপরে উঠানো

      ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      // Border (Square)
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

      ctx.font = "bold 45px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.fillText("SYSTEM BREACHED", avatarX + avatarSize + 60, 200);

      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(userName, avatarX + avatarSize + 60, 260);

      ctx.font = "bold 26px Arial";
      ctx.fillStyle = "#ff0000";
      ctx.fillText(`UID: ${targetID}`, avatarX + avatarSize + 60, 310);

      // ===== SAVE FILE =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `hack_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply(
        {
          body:
            "💻 SYSTEM BREACHED!\n\n" +
            `🔓 ${userName} hacked successfully!\n` +
            `🆔 UID: ${targetID}\n\n` +
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
