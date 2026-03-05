const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "2.0",
    author: "Alihsan Shourov",
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

  onStart: async function ({
    event,
    message,
    usersData,
    args,
    getLang,
    resolveTargetID
  }) {
    try {
      const senderID = event.senderID;

      // ===== Target Detect =====
      let targetID = resolveTargetID(args);

      // UID support
      if (!targetID && args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }

      if (!targetID)
        return message.reply(getLang("noTag"));

      // ===== Avatar URL =====
      const avatarURL1 = await usersData.getAvatarUrl(senderID);
      const avatarURL2 = await usersData.getAvatarUrl(targetID);

      // ===== Generate Slap Image =====
      const img = await new DIG.Batslap().getImage(
        avatarURL1,
        avatarURL2
      );

      // ===== Temp Folder =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(
        tmpDir,
        `slap_${Date.now()}.png`
      );

      fs.writeFileSync(filePath, Buffer.from(img));

      message.reply(
        {
          body: "Bópppp 😵‍💫😵",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("SLAP ERROR:", err);
      message.reply("⚠️ Slap command failed.");
    }
  }
};