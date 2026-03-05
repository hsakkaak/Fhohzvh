const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "jail",
    version: "9.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Wanted jail poster",
    category: "fun",
    guide: "{p}jail @mention OR reply"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, mentions, messageReply } = event;

    let uid;
    let name;

    // ===== GET TARGET =====
    if (Object.keys(mentions || {}).length > 0) {
      uid = Object.keys(mentions)[0];
    } else if (messageReply?.senderID) {
      uid = messageReply.senderID;
    } else {
      uid = event.senderID;
    }

    try {
      name = await usersData.getName(uid);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const avatarPath = path.join(cacheDir, `avatar_${uid}.jpg`);
      const outputPath = path.join(cacheDir, `jail_${Date.now()}.png`);

      // ===== DOWNLOAD AVATAR =====
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      const avatarData = (
        await axios.get(avatarURL, { responseType: "arraybuffer" })
      ).data;

      fs.writeFileSync(avatarPath, Buffer.from(avatarData));

      // ===== GENERATE IMAGE =====
      const avatar = await loadImage(avatarPath);

      const width = 600;
      const height = 800;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.font = "bold 100px Arial";
      ctx.fillStyle = "#ef4444";
      ctx.textAlign = "center";
      ctx.fillText("WANTED", width / 2, 120);

      // Avatar circle
      const radius = 200;
      const centerX = width / 2;
      const centerY = height / 2 + 20;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        avatar,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      );
      ctx.restore();

      // Jail Bars
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 20;

      const barCount = 8;
      const spacing = width / (barCount + 1);

      for (let i = 1; i <= barCount; i++) {
        const x = i * spacing;
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.lineTo(x, height - 180);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Locked Text
      ctx.font = "italic 50px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Locked Up!", width / 2, height - 100);

      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(name.toUpperCase(), width / 2, height - 50);

      fs.writeFileSync(outputPath, canvas.toBuffer());

      // ===== SEND =====
      await api.sendMessage(
        {
          body: `🔒 @${name} is Locked Up!`,
          mentions: [{ tag: name, id: uid }],
          attachment: fs.createReadStream(outputPath)
        },
        threadID,
        () => {
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        },
        messageID
      );

    } catch (err) {
      console.log("JAIL ERROR:", err);
      api.sendMessage("⚠️ Jail image failed.", threadID, messageID);
    }
  }
};
