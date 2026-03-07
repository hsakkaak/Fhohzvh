const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

const API_CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";
const BG_GIF = "https://files.catbox.moe/ptd7km.gif";

// owner encoded
const ownerEncoded = "QWxpaHNhbiBTaG91cm92";
function getOwner() {
  return Buffer.from(ownerEncoded, "base64").toString("utf8");
}

const getApiUrl = async () => {
  try {
    const response = await axios.get(API_CONFIG_URL);
    const albumUrl = response.data.album;
    if (!albumUrl) throw new Error("Album API URL missing");
    return albumUrl;
  } catch (err) {
    console.error("API URL Error:", err);
    throw new Error("Album API Fetch Failed");
  }
};

module.exports.config = {
  name: "album",
  aliases: [],
  version: "2.1.0",
  author: "Ullash + Edited by Shourov",
  countDown: 5,
  role: 0,
  category: "Media",
  shortDescription: "Video/Photo Album",
  longDescription: "Choose album categories and receive media instantly",
  guide: "{p}album"
};

const page1 = ["funny", "islamic", "sad", "anime", "cartoon", "love", "horny", "couple", "flower", "marvel"];
const page2 = ["aesthetic", "sigma", "lyrics", "cat", "18plus", "freefire", "football", "girl", "friends", "cricket"];

const categoriesAll = [
  "funny","islamic","sad","anime","cartoon","love","horny",
  "couple","flower","marvel","aesthetic","sigma","lyrics",
  "cat","18plus","freefire","football","girl","friends","cricket"
];

// fancy number
const toBoldNum = (n) => String(n).replace(/[0-9]/g, (c) => String.fromCodePoint(0x1d7ec + parseInt(c)));

const formatOptions = (list, start = 1) =>
  list.map((opt, i) => `🔴 | ${toBoldNum(i + start)}. 𝐒𝐄𝐋𝐄𝐂𝐓 ➤ 𝐀𝐋𝐁𝐔𝐌 ➤ ${opt}`).join("\n");

async function getGifStream(url){
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

module.exports.onStart = async function ({ message, event, args }) {
  const { senderID } = event;

  // PAGE 2
  if (args[0] === "2") {
    const body =
`💫 𝐂𝐡𝐨𝐨𝐬𝐞 𝐚𝐧 𝐚𝐥𝐛𝐮𝐦 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐁𝐚𝐛𝐲 💫
✺━━━━━━━◈◉◈━━━━━━━✺
${formatOptions(page2, 11)}
✺━━━━━━━◈◉◈━━━━━━━✺
🎯 | 𝐏𝐚𝐠𝐞 [𝟐/𝟐]
ℹ | 𝐓𝐲𝐩𝐞: /album - 𝐩𝐫𝐞𝐯𝐢𝐨𝐮𝐬 𝐩𝐚𝐠𝐞
✺━━━━━━━◈◉◈━━━━━━━✺
🟢 𝐎𝐰𝐧𝐞𝐫: ${getOwner()}`;

    const gif = await getGifStream(BG_GIF);

    return message.reply(
      { body, attachment: gif },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: senderID,
          categories: page2,
          page: 2
        });
      }
    );
  }

  // PAGE 1
  if (!args[0] || args[0].toLowerCase() === "list") {

    const body =
`💫 𝐂𝐡𝐨𝐨𝐬𝐞 𝐚𝐧 𝐚𝐥𝐛𝐮𝐦 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐁𝐚𝐛𝐲 💫
✺━━━━━━━◈◉◈━━━━━━━✺
${formatOptions(page1)}
✺━━━━━━━◈◉◈━━━━━━━✺
🎯 | 𝐏𝐚𝐠𝐞 [𝟏/𝟐]
ℹ | 𝐓𝐲𝐩𝐞: /album 2 - 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞
✺━━━━━━━◈◉◈━━━━━━━✺
🟢 𝐎𝐰𝐧𝐞𝐫: ${getOwner()}`;

    const gif = await getGifStream(BG_GIF);

    return message.reply(
      { body, attachment: gif },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: senderID,
          categories: page1,
          page: 1
        });
      }
    );
  }

  // DIRECT CATEGORY
  const givenCategory = args[0].toLowerCase();
  if (!categoriesAll.includes(givenCategory))
    return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲! 𝐓𝐲𝐩𝐞 '/album' 𝐭𝐨 𝐬𝐞𝐞 𝐥𝐢𝐬𝐭.");

  return message.reply(`📁 Loading category: ${givenCategory}... Please use the menu.`);
};

module.exports.onReply = async function ({ message, event, Reply }) {

  if (event.senderID !== Reply.author)
    return message.reply("❌ 𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐮𝐬𝐞𝐫 𝐰𝐡𝐨 𝐨𝐩𝐞𝐧𝐞𝐝 𝐭𝐡𝐞 𝐦𝐞𝐧𝐮 𝐜𝐚𝐧 𝐬𝐞𝐥𝐞𝐜𝐭.");

  let num = parseInt(event.body);
  if (isNaN(num)) return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫.");

  const selectedList = Reply.categories;

  if (Reply.page === 2 || (num > 10 && num <= 20)) {
    if (num > 10) num = num - 10;
  }

  if (num < 1 || num > selectedList.length)
    return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.");

  const finalCategory = selectedList[num - 1];

  const adminID = "61588161951831";
  if ((finalCategory === "horny" || finalCategory === "18plus") && event.senderID !== adminID)
    return message.reply("🚫 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐮𝐭𝐡𝐨𝐫𝐢𝐳𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.");

  try {

    const BASE_API_URL = await getApiUrl();
    const res = await axios.get(`${BASE_API_URL}/album?type=${finalCategory}`);

    const media = res.data.data;
    if (!media) return message.reply("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐯𝐢𝐝𝐞𝐨.");

    const fileName = path.basename(media).split("?")[0];
    const savePath = path.join(__dirname, "cache", `${Date.now()}_${fileName}`);

    const file = await axios.get(media, { responseType: "stream" });
    const writer = fs.createWriteStream(savePath);

    file.data.pipe(writer);

    writer.on("finish", () => {
      message.reply(
        {
          body: `✨ 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 ${finalCategory} 𝐯𝐢𝐝𝐞𝐨`,
          attachment: fs.createReadStream(savePath)
        },
        () => fs.unlinkSync(savePath)
      );
    });

  } catch (err) {
    console.error(err);
    return message.reply("❌ 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!");
  }
};