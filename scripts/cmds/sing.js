const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// ================= BASE API LOADER =================
let BASE_API = null;

async function getBaseApi() {
  if (BASE_API) return BASE_API;

  const res = await axios.get(
    "https://raw.githubusercontent.com/MR-ALIHSAN SHOUROV-004/ALIHSAN SHOUROV-BOT-STORAGE/refs/heads/main/APIURL.json"
  );

  BASE_API = res.data.api;
  return BASE_API;
}

module.exports = {
  config: {
    name: "sing",
    version: "4.5",
    author: "Chitron Bhattacharjee ✦ UI Upgrade by Mahabub",
    countDown: 5,
    role: 0,
    longDescription: {
      en: "🎶 Search song → reply number → auto download → auto unsend (valid only) → auto delete"
    },
    category: "media",
    guide: {
      en: "{pn} <song name>\nExample: sing toh phir aao"
    },
  },

  // ================= SEARCH =================
  onStart: async ({ api, args, event }) => {
    if (!args.length) {
      return api.sendMessage(
        "❌ **Song name dao na!**\n\n📌 Example:\n➤ `sing toh phir aao`",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const BASE = await getBaseApi();
      const query = encodeURIComponent(args.join(" "));
      const searchUrl = `${BASE}/mahabub/ytsearch?q=${query}`;
      const { data } = await axios.get(searchUrl);

      if (!data?.status || !data.results?.length) {
        return api.sendMessage(
          "🚫 **No results found!**\nTry another keyword 🎧",
          event.threadID
        );
      }

      const results = data.results.slice(0, 10);

      let body =
        `🎧✨ **SONG SEARCH RESULTS** ✨🎧\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `🔎 **Query:** ${data.query}\n\n`;

      let attachments = [];

      for (let i = 0; i < results.length; i++) {
        body += `🎵 **${i + 1}.** ${results[i].title}\n`;

        try {
          const img = await axios.get(results[i].thumbnails.high, {
            responseType: "stream",
          });
          attachments.push(img.data);
        } catch {}
      }

      body +=
        `\n━━━━━━━━━━━━━━━━━━━\n` +
        `📝 **Reply with a number (1-${results.length})**\n` +
        `⬇️ To download audio 🎶`;

      api.sendMessage(
        { body, attachment: attachments },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "sing",
            author: event.senderID,
            results,
            searchMsgID: info.messageID
          });
        },
        event.messageID
      );

      api.setMessageReaction("🎶", event.messageID, () => {}, true);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ **Search failed!** Try again later.", event.threadID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  // ================= REPLY & DOWNLOAD =================
  onReply: async ({ api, event, Reply }) => {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);

    // ❌ INVALID NUMBER → DO NOT UNSEND
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚠️ **Invalid number!**\nReply between the given range 🔢",
        event.threadID,
        event.messageID
      );
    }

    // ✅ VALID NUMBER → UNSEND SEARCH MESSAGE
    if (Reply.searchMsgID) {
      api.unsendMessage(Reply.searchMsgID);
    }

    const video = Reply.results[choice - 1];
    const videoId = video.videoId;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const BASE = await getBaseApi();
      const apiUrl = `${BASE}/mahabub/ytmp3v2?url=${videoId}`;
      const { data } = await axios.get(apiUrl);

      if (!data?.status || !data.data?.link) {
        return api.sendMessage("❌ **Download failed!**", event.threadID);
      }

      const filePath = path.join(cacheDir, `${videoId}.mp3`);
      const audioStream = await axios.get(data.data.link, {
        responseType: "stream",
      });

      audioStream.data
        .pipe(fs.createWriteStream(filePath))
        .on("finish", () => {
          api.sendMessage(
            {
              body:
                `🎶 **NOW PLAYING** 🎶\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `🎵 **Title:** ${data.data.title}\n` +
                `⏱ **Duration:** ${Math.floor(data.data.duration)} sec\n` +
                `📦 **Size:** ${(data.data.filesize / 1024 / 1024).toFixed(2)} MB\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `💿 Enjoy your music ✨`,
              attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            () => {
              if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
            },
            event.messageID
          );
        });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ **Audio download error!**", event.threadID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },
};