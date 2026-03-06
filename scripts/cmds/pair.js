const fs = require("fs-extra");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    version: "3.0",
    author: "Shourov",
    countDown: 5,
    role: 0,
    description: "Pair with someone ❤️",
    category: "fun",
    guide: "{p}pair @mention / reply / UID"
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {

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
          id => id != senderID && id != api.getCurrentUserID()
        );

        if (!members.length)
          return api.sendMessage("❌ No partner found.", event.threadID);

        targetID = members[Math.floor(Math.random() * members.length)];
      }

      // ===== Names =====
      const name1 = await usersData.getName(senderID) || "User";
      const name2 = await usersData.getName(targetID) || "User";

      // ===== Love % =====
      const percent = Math.floor(Math.random() * 101);

      // ===== Avatar =====
      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      const avt1 = (
        await axios.get(avatar1, { responseType: "arraybuffer" })
      ).data;

      const avt2 = (
        await axios.get(avatar2, { responseType: "arraybuffer" })
      ).data;

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const pathAvt1 = path.join(tmpDir, "avt1.png");
      const pathAvt2 = path.join(tmpDir, "avt2.png");
      const pathImg = path.join(tmpDir, `pair_${Date.now()}.png`);

      fs.writeFileSync(pathAvt1, Buffer.from(avt1));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2));

      // ===== Canvas =====
      const background = await loadImage(
        "https://i.imgur.com/QZ8F5ZP.jpg"
      );

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatarImg1 = await loadImage(pathAvt1);
      const avatarImg2 = await loadImage(pathAvt2);

      // LEFT
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 320, 150, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg1, 150, 170, 300, 300);
      ctx.restore();

      // RIGHT
      ctx.save();
      ctx.beginPath();
      ctx.arc(900, 320, 150, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg2, 750, 170, 300, 300);
      ctx.restore();

      fs.writeFileSync(pathImg, canvas.toBuffer());

      fs.unlinkSync(pathAvt1);
      fs.unlinkSync(pathAvt2);

      const mention1 = { tag: name1, id: senderID };
      const mention2 = { tag: name2, id: targetID };

      const msg =
        `💞 LOVE PAIR 💞\n\n` +
        `${name1} ❤️ ${name2}\n\n` +
        `💘 Love Match: ${percent}%`;

      return api.sendMessage(
        {
          body: msg,
          mentions: [mention1, mention2],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("⚠️ Pair command failed.", event.threadID);
    }
  }
};