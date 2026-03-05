const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    version: "2.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    category: "fun"
  },

  onStart: async function ({ api, event, args, resolveTargetID }) {
    try {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const pathImg = path.join(cacheDir, `pair_${Date.now()}.png`);
      const pathAvt1 = path.join(cacheDir, "avt1.png");
      const pathAvt2 = path.join(cacheDir, "avt2.png");

      const id1 = event.senderID;

      // ===== TARGET DETECT =====
      let id2 = resolveTargetID(args);

      // UID support
      if (!id2 && args[0] && !isNaN(args[0])) {
        id2 = args[0];
      }

      // Random partner if no target
      if (!id2) {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const members = threadInfo.participantIDs.filter(
          id => id !== id1 && id !== api.getCurrentUserID()
        );

        if (!members.length)
          return api.sendMessage("No suitable partner found.", event.threadID);

        id2 = members[Math.floor(Math.random() * members.length)];
      }

      const name1 = (await api.getUserInfo(id1))[id1].name;
      const name2 = (await api.getUserInfo(id2))[id2].name;

      // ===== MATCH RATE =====
      const rd1 = Math.floor(Math.random() * 100) + 1;
      const special = ["∞", "99.99", "0.01", "-1"];
      const matchRate =
        Math.random() < 0.2
          ? special[Math.floor(Math.random() * special.length)]
          : rd1;

      // ===== LOVE NOTES =====
      const notes = [
        "Every time I see you, my heart skips a beat.",
        "You’re my today and all of my tomorrows.",
        "In your smile, I see something more beautiful than the stars.",
        "You make my heart race without trying.",
        "Every love story is beautiful, but ours is my favorite."
      ];
      const lovelyNote =
        notes[Math.floor(Math.random() * notes.length)];

      // ===== AVATARS =====
      const avt1 = (
        await axios.get(
          `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avt2 = (
        await axios.get(
          `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(pathAvt1, Buffer.from(avt1));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2));

      // ===== BACKGROUND =====
      const bgURL =
        "https://i.postimg.cc/nrgPFtDG/Picsart-25-08-12-20-22-41-970.png";

      const bg = (
        await axios.get(bgURL, { responseType: "arraybuffer" })
      ).data;

      fs.writeFileSync(pathImg, Buffer.from(bg));

      const baseImage = await loadImage(pathImg);
      const imgAvt1 = await loadImage(pathAvt1);
      const imgAvt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(
        baseImage.width,
        baseImage.height
      );
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Square avatars
      ctx.drawImage(imgAvt1, 120, 170, 300, 300);
      ctx.drawImage(imgAvt2, canvas.width - 420, 170, 300, 300);

      fs.writeFileSync(pathImg, canvas.toBuffer());

      // Clean avatar temp
      fs.unlinkSync(pathAvt1);
      fs.unlinkSync(pathAvt2);

      const bodyText = `
🌸💞  C O N G R A T S  💞🌸

@${name1} ❤️ @${name2}

💖 Match Rate: ${matchRate}% 💖

🌷 Lovely Note 🌷
❝ ${lovelyNote} ❞
`;

      return api.sendMessage(
        {
          body: bodyText,
          mentions: [
            { tag: name1, id: id1 },
            { tag: name2, id: id2 }
          ],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (err) {
      console.error("PAIR2 ERROR:", err);
      api.sendMessage("⚠️ Pair2 command failed.", event.threadID);
    }
  }
};