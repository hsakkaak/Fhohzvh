const axios = require("axios");
const https = require("https");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "dog",
    version: "2.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Dog with profile",
    longDescription: "Dog image with mentioned/replied user's profile on face",
    category: "fun",
    guide: "+dog @mention / reply / UID"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const senderID = event.senderID;

      // ===== Target Detect (Reply / Mention / UID) =====
      let targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!targetID && event.body) {
        const uidArg = event.body.split(" ")[1];
        if (uidArg && !isNaN(uidArg)) {
          targetID = uidArg;
        }
      }

      if (!targetID) targetID = senderID;

      // ===== Get Dog Image =====
      const res = await axios.get("https://dog.ceo/api/breeds/image/random");
      const dogURL = res.data.message;

      // ===== Get Avatar =====
      const avatarURL = await usersData.getAvatarUrl(targetID);

      // ===== Load Images =====
      const dogImg = await loadImage(dogURL);
      const avatar = await loadImage(avatarURL);

      // ===== Create Canvas =====
      const canvas = createCanvas(dogImg.width, dogImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(dogImg, 0, 0, canvas.width, canvas.height);

      // ===== Draw Profile on Dog Face (Center) =====
      const size = 200;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        size / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        avatar,
        canvas.width / 2 - size / 2,
        canvas.height / 2 - size / 2,
        size,
        size
      );
      ctx.restore();

      // ===== Temp Folder =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `dog_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

      message.reply(
        {
          body: "🐶 Here's your doggo!",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("DOG ERROR:", err);
      message.reply("⚠️ Dog command failed.");
    }
  }
};