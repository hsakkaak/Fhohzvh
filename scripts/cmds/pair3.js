const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    version: "2.0.0",
    author: "Alihsan Shourov",
    category: "fun",
    role: 0,
    countDown: 5,
    guide: "{p}pair3 @mention / reply / uid"
  },

  onStart: async function ({ api, event, usersData, args, resolveTargetID }) {
    try {
      // ===== CACHE =====
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const outputPath = path.join(cacheDir, `pair4_${Date.now()}.png`);

      const senderID = event.senderID;
      const senderName = await usersData.getName(senderID);

      const threadInfo = await api.getThreadInfo(event.threadID);
      const users = threadInfo.userInfo || [];

      const myData = users.find(u => u.id === senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage(
          "❌ Your gender is not set, cannot find match.",
          event.threadID,
          event.messageID
        );
      }

      // ===== TARGET DETECT =====
      let targetID = resolveTargetID(args);

      // UID support
      if (!targetID && args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }

      // ===== AUTO RANDOM MATCH =====
      let candidates = [];

      if (!targetID) {
        const myGender = myData.gender.toUpperCase();
        const botID = api.getCurrentUserID();

        if (myGender === "MALE") {
          candidates = users.filter(
            u => u.gender === "FEMALE" && u.id !== senderID && u.id !== botID
          );
        } else if (myGender === "FEMALE") {
          candidates = users.filter(
            u => u.gender === "MALE" && u.id !== senderID && u.id !== botID
          );
        }

        if (!candidates.length) {
          return api.sendMessage(
            "😔 No suitable match found in this group.",
            event.threadID,
            event.messageID
          );
        }

        targetID = candidates[Math.floor(Math.random() * candidates.length)].id;
      }

      const targetName = await usersData.getName(targetID);

      // ===== LOVE % =====
      const lovePercentage = Math.floor(Math.random() * 100) + 1;

      // ===== CANVAS =====
      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(
        "https://i.postimg.cc/4xSzJ7SZ/Picsart-25-08-15-19-44-03-606.jpg"
      );

      const avatar1 = await loadImage(
        await usersData.getAvatarUrl(senderID)
      );
      const avatar2 = await loadImage(
        await usersData.getAvatarUrl(targetID)
      );

      ctx.drawImage(background, 0, 0, width, height);

      // LEFT AVATAR
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar1, 115, 115, 170, 170);
      ctx.restore();

      // RIGHT AVATAR
      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 200, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar2, 515, 115, 170, 170);
      ctx.restore();

      fs.writeFileSync(outputPath, canvas.toBuffer());

      const bodyText =
        `🥰 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n\n` +
        `💑 ${senderName} ❤️ ${targetName}\n` +
        `💌 Wish you both endless happiness 💕\n\n` +
        `💖 Love Percentage: ${lovePercentage}%`;

      return api.sendMessage(
        {
          body: bodyText,
          mentions: [
            { tag: senderName, id: senderID },
            { tag: targetName, id: targetID }
          ],
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        () => fs.unlinkSync(outputPath),
        event.messageID
      );
    } catch (err) {
      console.error("PAIR3 ERROR:", err);
      return api.sendMessage(
        "❌ Pair3 command failed.",
        event.threadID,
        event.messageID
      );
    }
  }
};