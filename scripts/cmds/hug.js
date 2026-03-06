const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hug",
    aliases: ["embrace"],
    version: "2.0",
    author: "Shourov Fix",
    countDown: 5,
    role: 0,
    shortDescription: "Give someone a hug",
    category: "fun",
    guide: "{p}hug @mention / reply"
  },

  onStart: async function ({ api, event, usersData }) {
    try {

      let targetID =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID;

      if (!targetID)
        return api.sendMessage(
          "❌ Please mention or reply someone to hug 🤗",
          event.threadID,
          event.messageID
        );

      if (targetID === event.senderID)
        return api.sendMessage(
          "🤗 You cannot hug yourself!",
          event.threadID,
          event.messageID
        );

      const senderID = event.senderID;

      const name1 = await usersData.getName(senderID);
      const name2 = await usersData.getName(targetID);

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir, { recursive: true });

      const avt1 = path.join(tmpDir, `avt1_${Date.now()}.png`);
      const avt2 = path.join(tmpDir, `avt2_${Date.now()}.png`);
      const imgPath = path.join(tmpDir, `hug_${Date.now()}.png`);

      // avatar download
      const avatar1 = (
        await axios.get(
          `https://graph.facebook.com/${senderID}/picture?width=512&height=512`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avatar2 = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512`,
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(avt1, avatar1);
      fs.writeFileSync(avt2, avatar2);

      const background = await loadImage(
        "https://i.imgur.com/JJ4Wq5E.png"
      );

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const avatarImg1 = await loadImage(avt1);
      const avatarImg2 = await loadImage(avt2);

      // LEFT
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 200, 90, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg1, 210, 110, 180, 180);
      ctx.restore();

      // RIGHT
      ctx.save();
      ctx.beginPath();
      ctx.arc(520, 200, 90, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg2, 430, 110, 180, 180);
      ctx.restore();

      fs.writeFileSync(imgPath, canvas.toBuffer());

      fs.unlinkSync(avt1);
      fs.unlinkSync(avt2);

      const messages = [
        `${name1} 🤗 hugged ${name2}`,
        `${name1} sends a warm hug to ${name2}`,
        `${name1} gives ${name2} a lovely hug 💕`
      ];

      const msg = messages[Math.floor(Math.random() * messages.length)];

      return api.sendMessage(
        {
          body: msg,
          mentions: [
            { tag: name1, id: senderID },
            { tag: name2, id: targetID }
          ],
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );

    } catch (err) {
      console.log("HUG ERROR:", err);
      return api.sendMessage(
        "⚠️ Hug command failed.",
        event.threadID,
        event.messageID
      );
    }
  }
};