const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    version: "3.0.0",
    author: "Shourov Fixed",
    category: "fun",
    role: 0,
    countDown: 5,
    guide: "{p}pair3 @mention / reply / uid"
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const outputPath = path.join(cacheDir, `pair_${Date.now()}.png`);

      const senderID = event.senderID;
      let targetID;

      // ===== Mention =====
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      // ===== Reply =====
      else if (event.messageReply) {
        targetID = event.messageReply.senderID;
      }

      // ===== UID =====
      else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }

      // ===== Random Pair =====
      else {
        const threadInfo = await api.getThreadInfo(event.threadID);

        const members = threadInfo.participantIDs.filter(
          id => id !== senderID && id !== api.getCurrentUserID()
        );

        if (!members.length)
          return api.sendMessage(
            "❌ No partner found in this group.",
            event.threadID,
            event.messageID
          );

        targetID = members[Math.floor(Math.random() * members.length)];
      }

      const senderName = await usersData.getName(senderID);
      const targetName = await usersData.getName(targetID);

      // ===== Love % =====
      const lovePercentage = Math.floor(Math.random() * 101);

      // ===== Canvas =====
      const width = 800;
      const height = 400;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(
        "https://i.imgur.com/QZ8F5ZP.jpg"
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
`🥰 Successful Pairing

💑 ${senderName} ❤️ ${targetName}

💖 Love Percentage: ${lovePercentage}%`;

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
      console.log("PAIR3 ERROR:", err);
      return api.sendMessage(
        "❌ Pair3 command failed.",
        event.threadID,
        event.messageID
      );
    }
  }
};