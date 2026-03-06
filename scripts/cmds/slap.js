const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "2.1",
    author: "Alihsan Shourov Fix",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone",
    longDescription: "Slap image with reply/mention/UID support",
    category: "fun",
    guide: "{pn} @mention / reply / UID"
  },

  langs: {
    en: {
      noTag: "😒 Whom are you slapping? Reply / Mention / UID needed!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
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

      if (!targetID)
        return message.reply(getLang("noTag"));

      // ===== Avatar =====
      const avatarURL1 = await usersData.getAvatarUrl(senderID);
      const avatarURL2 = await usersData.getAvatarUrl(targetID);

      // ===== Generate Image =====
      const img = await new DIG.Batslap().getImage(
        avatarURL1,
        avatarURL2
      );

      // ===== Temp Folder =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `slap_${Date.now()}.png`);

      fs.writeFileSync(filePath, Buffer.from(img));

      return message.reply(
        {
          body: "💥 BOPPP 😵",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("SLAP ERROR:", err);
      return message.reply("⚠️ Slap command failed.");
    }
  }
};