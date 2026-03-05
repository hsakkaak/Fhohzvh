const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    version: "2.0",
    author: "Alihsan Shourov",
    countDown: 10,
    role: 0,
    category: "LOVE",
    guide: "{pn} @mention / reply / UID"
  },

  onStart: async function ({
    api,
    event,
    usersData,
    args,
    resolveTargetID
  }) {
    try {
      const senderID = event.senderID;

      // ===== TARGET DETECT =====
      let targetID = resolveTargetID(args);

      // UID support
      if (!targetID && args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }

      // If no mention/reply/uid → random partner
      if (!targetID) {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const members = threadInfo.participantIDs.filter(
          id => id !== senderID && id !== api.getCurrentUserID()
        );
        if (!members.length)
          return api.sendMessage("❌ No partner found.", event.threadID);
        targetID = members[Math.floor(Math.random() * members.length)];
      }

      // ===== GET NAMES =====
      const name1 = await usersData.getName(senderID) || "Unknown";
      const name2 = await usersData.getName(targetID) || "Unknown";

      // ===== RANDOM LOVE % =====
      const percentage = Math.floor(Math.random() * 100) + 1;

      const loveNotes = [
        "Two souls, one destiny 💞",
        "Love found its way 💖",
        "Perfect match ✨",
        "Hearts connected 💘"
      ];
      const note =
        loveNotes[Math.floor(Math.random() * loveNotes.length)];

      // ===== AVATAR GRAPH API =====
      const avt1 = (
        await axios.get(
          `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avt2 = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const pathAvt1 = path.join(tmpDir, "avt1.png");
      const pathAvt2 = path.join(tmpDir, "avt2.png");
      const pathImg = path.join(tmpDir, `pair_${Date.now()}.png`);

      fs.writeFileSync(pathAvt1, Buffer.from(avt1));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2));

      // ===== BACKGROUND =====
      const bg = await loadImage(
        "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg"
      );

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, bg.width, bg.height);

      const avatar1 = await loadImage(pathAvt1);
      const avatar2 = await loadImage(pathAvt2);

      // LEFT PROFILE
      ctx.save();
      ctx.beginPath();
      ctx.arc(330, 340, 160, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 170, 180, 320, 320);
      ctx.restore();

      // RIGHT PROFILE
      ctx.save();
      ctx.beginPath();
      ctx.arc(1000, 340, 160, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 840, 180, 320, 320);
      ctx.restore();

      fs.writeFileSync(pathImg, canvas.toBuffer());

      // Cleanup avatar temp
      fs.unlinkSync(pathAvt1);
      fs.unlinkSync(pathAvt2);

      const mention1 = { tag: `@${name1}`, id: senderID };
      const mention2 = { tag: `@${name2}`, id: targetID };

      const bodyText =
        `💞 𝐋𝐨𝐯𝐞 𝐏𝐚𝐢𝐫 💞\n\n` +
        `💑 ${mention1.tag} ❤️ ${mention2.tag}\n` +
        `💌 ${note}\n` +
        `🔗 Love Match: ${percentage}% 💖`;

      return api.sendMessage(
        {
          body: bodyText,
          mentions: [mention1, mention2],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );

    } catch (err) {
      console.error("PAIR ERROR:", err);
      api.sendMessage("⚠️ Pair command failed.", event.threadID);
    }
  }
};