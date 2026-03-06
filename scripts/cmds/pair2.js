const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    version: "3.0.0",
    author: "Shourov Fixed",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}pair2 @mention / reply / uid"
  },

  onStart: async function ({ api, event, args }) {
    try {

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const pathImg = path.join(cacheDir, `pair_${Date.now()}.png`);
      const pathAvt1 = path.join(cacheDir, `avt1_${Date.now()}.png`);
      const pathAvt2 = path.join(cacheDir, `avt2_${Date.now()}.png`);

      const id1 = event.senderID;
      let id2;

      // ===== Mention =====
      if (Object.keys(event.mentions).length > 0) {
        id2 = Object.keys(event.mentions)[0];
      }

      // ===== Reply =====
      else if (event.messageReply) {
        id2 = event.messageReply.senderID;
      }

      // ===== UID =====
      else if (args[0] && !isNaN(args[0])) {
        id2 = args[0];
      }

      // ===== Random =====
      else {
        const threadInfo = await api.getThreadInfo(event.threadID);

        const members = threadInfo.participantIDs.filter(
          id => id !== id1 && id !== api.getCurrentUserID()
        );

        if (!members.length)
          return api.sendMessage("❌ No partner found.", event.threadID);

        id2 = members[Math.floor(Math.random() * members.length)];
      }

      // ===== Names =====
      const info1 = await api.getUserInfo(id1);
      const info2 = await api.getUserInfo(id2);

      const name1 = info1[id1].name;
      const name2 = info2[id2].name;

      // ===== Match Rate =====
      const percent = Math.floor(Math.random() * 101);

      // ===== Love Notes =====
      const notes = [
        "Love is not about finding someone to live with.",
        "You are my sunshine on cloudy days.",
        "Two hearts, one soul.",
        "Perfect love story begins here.",
        "Forever starts today."
      ];

      const note = notes[Math.floor(Math.random() * notes.length)];

      // ===== Avatar =====
      const avt1 = (
        await axios.get(
          `https://graph.facebook.com/${id1}/picture?width=720&height=720`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avt2 = (
        await axios.get(
          `https://graph.facebook.com/${id2}/picture?width=720&height=720`,
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(pathAvt1, Buffer.from(avt1));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2));

      // ===== Background =====
      const bg = await loadImage(
        "https://i.imgur.com/QZ8F5ZP.jpg"
      );

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const avatar1 = await loadImage(pathAvt1);
      const avatar2 = await loadImage(pathAvt2);

      // LEFT AVATAR
      ctx.beginPath();
      ctx.arc(300, 320, 150, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar1, 150, 170, 300, 300);
      ctx.restore();

      // RIGHT AVATAR
      ctx.beginPath();
      ctx.arc(900, 320, 150, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar2, 750, 170, 300, 300);

      fs.writeFileSync(pathImg, canvas.toBuffer());

      fs.unlinkSync(pathAvt1);
      fs.unlinkSync(pathAvt2);

      const bodyText =
`💞 LOVE PAIR 💞

${name1} ❤️ ${name2}

💘 Match Rate: ${percent}%

💌 ${note}`;

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
      console.log("PAIR2 ERROR:", err);
      api.sendMessage("⚠️ Pair2 command failed.", event.threadID);
    }
  }
};