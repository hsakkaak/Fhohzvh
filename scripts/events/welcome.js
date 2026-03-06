const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🔹 Preload font once
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");

    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");

      const fontUrl =
        "https://raw.githubusercontent.com/MR-ALIHSAN-SHOUROV-004/ALIHSAN-SHOUROV-BOT-STORAGE/main/fronts/tt-modernoir-trial.bold.ttf";

      const { data } = await axios.get(fontUrl, {
        responseType: "arraybuffer"
      });

      await fs.outputFile(fontPath, data);
      console.log("✅ Font downloaded");
    }

    registerFont(fontPath, { family: "ModernoirBold" });

    console.log("✅ Font registered: ModernoirBold");

  } catch (err) {
    console.error("❌ Font preload error:", err);
  }
})();

module.exports = {
  config: {
    name: "welcome",
    version: "4.2",
    author: "Alihsan Shourov",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api }) => {

    try {

      const { threadID, logMessageType, logMessageData } = event;

      const botID = api.getCurrentUserID();
      const addedParticipants = logMessageData.addedParticipants || [];

      // 🔹 BOT ADDED MESSAGE
      if (
        logMessageType === "log:subscribe" &&
        addedParticipants.some(p => p.userFbId === botID)
      ) {

        const nickname = global.GoatBot?.config?.nickNameBot || "Bot";
        await api.changeNickname(nickname, threadID, botID);

        const msg = `
━━━━━━━━━━━━━━━━━━━━━━
☔  ${nickname} CONNECTED
━━━━━━━━━━━━━━━━━━━━━━

👑 BOT OWNER
➤ 𝐀𝐋𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕

🌐 FACEBOOK
➤ facebook.com/shourov.sm24

📱 WHATSAPP
➤ wa.me/+8801709281334

📡 TELEGRAM
➤ t.me/

━━━━━━━━━━━━━━━━━━━━━━
`;

        const localImage = fs.createReadStream(
          path.join(__dirname, "shourov", "shourov_c.gif")
        );

        const onlineImage =
          await global.utils.getStreamFromURL(
            "https://files.catbox.moe/67v8il.gif"
          );

        const attachment =
          localImage && Math.random() < 0.5
            ? localImage
            : onlineImage;

        await api.sendMessage(
          {
            body: msg,
            attachment
          },
          threadID
        );

        return;
      }

      // 🔹 NORMAL USER ADDED
      if (logMessageType !== "log:subscribe") return;

      const threadData = await threadsData.get(threadID);
      const threadName = threadData.threadName || "Group Chat";

      const memberCount =
        (await api.getThreadInfo(threadID)).participantIDs.length;

      const user = addedParticipants[0];
      const userName = user.fullName;
      const userID = user.userFbId;

      const avatarUrl =
        `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // 🎨 CANVAS
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // gradient background
      const grad = ctx.createLinearGradient(0, 0, 1000, 500);

      grad.addColorStop(0, "#141E30");
      grad.addColorStop(0.5, "#243B55");
      grad.addColorStop(1, "#0F2027");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1000, 500);

      // glow circles
      ctx.beginPath();
      ctx.arc(200, 120, 80, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,255,255,0.2)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(800, 400, 120, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,0,255,0.2)";
      ctx.fill();

      // member avatar
      const avatarResponse = await axios.get(
        avatarUrl,
        { responseType: "arraybuffer" }
      );

      const avatar = await loadImage(avatarResponse.data);

      ctx.save();
      ctx.beginPath();
      ctx.arc(500, 170, 90, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(avatar, 410, 80, 180, 180);

      ctx.restore();

      // avatar border
      ctx.beginPath();
      ctx.arc(500, 170, 95, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 6;
      ctx.stroke();

      // added by
      const adderID = event.author;

      const adderInfo = await api.getUserInfo(adderID);

      const adderUser =
        adderInfo[adderID]?.name || "Unknown";

      const adderAvatar = await loadImage(
        `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      ctx.save();
      ctx.beginPath();
      ctx.arc(160, 360, 60, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(adderAvatar, 100, 300, 120, 120);

      ctx.restore();

      ctx.beginPath();
      ctx.arc(160, 360, 65, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 4;
      ctx.stroke();

      // text
      ctx.textAlign = "center";

      ctx.font = "bold 55px ModernoirBold";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("WELCOME", 500, 330);

      ctx.font = "bold 35px ModernoirBold";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(userName, 500, 380);

      ctx.font = "bold 25px ModernoirBold";
      ctx.fillStyle = "#ffea00";
      ctx.fillText("Added by " + adderUser, 500, 430);

      // save image
      const imgPath =
        path.join(__dirname, "cache", `welcome_${userID}.png`);

      await fs.ensureDir(path.dirname(imgPath));

      fs.writeFileSync(
        imgPath,
        canvas.toBuffer("image/png")
      );

      // welcome body
      const body = `
╔══════ ✦ WELCOME ✦ ══════╗

💐 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐀𝐥𝐚𝐢𝐤𝐮𝐦 💐

✨ 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥 ✨
➤ ${userName}

🎉 Welcome to
➤ ${threadName}

👥 You are the
➤ ${memberCount}th member of this group

━━━━━━━━━━━━━━━━━━

🤖 BOT OWNER
𝐀𝐋𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕

━━━━━━━━━━━━━━━━━━
`;

      await api.sendMessage(
        {
          body,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("❌ Welcome event error:", err);
    }
  }
};