const axios = require("axios");
const fs = require("fs");
const { shortenURL } = global.utils;

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.2",
    author: "Alihsan Shourov",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from all platforms"
    },
    category: "media"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {

    const link = event.body ? event.body.trim() : "";

    try {

      if (
        link.startsWith("https://vt.tiktok.com") ||
        link.startsWith("https://www.tiktok.com") ||
        link.startsWith("https://www.facebook.com") ||
        link.startsWith("https://www.instagram.com") ||
        link.startsWith("https://youtu.be") ||
        link.startsWith("https://youtube.com") ||
        link.startsWith("https://x.com") ||
        link.startsWith("https://twitter.com") ||
        link.startsWith("https://fb.watch")
      ) {

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const path = __dirname + `/cache/video.mp4`;

        // API call
        const res = await axios.get(
          `https://shourov-downloader.onrender.com/api/resolve?url=${encodeURIComponent(link)}`
        );

        const data = res.data.data;

        if (!data || !data.formats || data.formats.length === 0)
          return api.sendMessage("❌ Download option pawa jai nai", event.threadID);

        const videoUrl = data.formats[0].url;

        const video = (
          await axios.get(videoUrl, { responseType: "arraybuffer" })
        ).data;

        fs.writeFileSync(path, Buffer.from(video));

        const short = await shortenURL(videoUrl);

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage(
          {
            body: `🎬 ${data.title}\n🔗 ${short}`,
            attachment: fs.createReadStream(path)
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );

      }

    } catch (err) {

      api.setMessageReaction("❎", event.messageID, () => {}, true);

      api.sendMessage("❌ Download error", event.threadID, event.messageID);

      console.log(err);

    }

  }
};