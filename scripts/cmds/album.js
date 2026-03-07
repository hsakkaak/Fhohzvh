const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const { createCanvas } = require("canvas");

const API_CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";

// owner encoded
const ownerEncoded = "QWxpaHNhbiBTaG91cm92";
function getOwner() {
  return Buffer.from(ownerEncoded, "base64").toString("utf8");
}

const getApiUrl = async () => {
  try {
    const res = await axios.get(API_CONFIG_URL);
    if (!res.data.album) throw new Error("Album API URL missing");
    return res.data.album;
  } catch (err) {
    console.error(err);
    throw new Error("Album API Fetch Failed");
  }
};

module.exports.config = {
  name: "album",
  version: "2.0",
  author: "Ullash + Edited by Shourov",
  countDown: 5,
  role: 0,
  category: "Media",
  guide: "{p}album"
};

// banner generator
async function generateBanner(list) {

  const width = 900;
  const height = 600;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0,0,width,height);
  grad.addColorStop(0,"#0f2027");
  grad.addColorStop(1,"#2c5364");

  ctx.fillStyle = grad;
  ctx.fillRect(0,0,width,height);

  ctx.strokeStyle="#00ffff";
  ctx.lineWidth=8;
  ctx.strokeRect(10,10,width-20,height-20);

  ctx.strokeStyle="#ff00ff";
  ctx.strokeRect(20,20,width-40,height-40);

  ctx.shadowColor="#00ffff";
  ctx.shadowBlur=25;

  ctx.fillStyle="#ffffff";
  ctx.font="bold 40px Arial";
  ctx.textAlign="center";

  ctx.fillText("CHOOSE AN ALBUM CATEGORY", width/2, 80);

  ctx.shadowBlur=0;

  ctx.font="26px Arial";
  ctx.fillStyle="#00ffff";

  let y = 150;

  list.forEach((cat,i)=>{
    ctx.fillText(`${i+1}. ${cat}`, width/2, y);
    y += 40;
  });

  ctx.fillStyle="#ffffff";
  ctx.font="20px Arial";
  ctx.fillText(`Owner: ${getOwner()}`, width/2, height-40);

  const filePath = path.join(__dirname,"cache","album_menu.png");

  await fs.ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, canvas.toBuffer());

  return filePath;
}

module.exports.onStart = async function ({ message, event, args }) {

  const page1 = ["funny","islamic","sad","anime","cartoon","love","horny","couple","flower","marvel"];
  const page2 = ["aesthetic","sigma","lyrics","cat","18plus","freefire","football","girl","friends","cricket"];

  if (args[0] === "2") {

    const banner = await generateBanner(page2);

    return message.reply({
      attachment: fs.createReadStream(banner)
    }, (err,info)=>{
      global.GoatBot.onReply.set(info.messageID,{
        commandName:"album",
        author:event.senderID,
        categories:page2
      });
    });
  }

  const banner = await generateBanner(page1);

  return message.reply({
    attachment: fs.createReadStream(banner)
  }, (err,info)=>{
    global.GoatBot.onReply.set(info.messageID,{
      commandName:"album",
      author:event.senderID,
      categories:page1
    });
  });

};

module.exports.onReply = async function ({ message, event, Reply }) {

  if (event.senderID !== Reply.author)
    return message.reply("❌ Only menu opener can choose.");

  const num = parseInt(event.body);

  if (isNaN(num))
    return message.reply("❌ Reply with a number.");

  const category = Reply.categories[num-1];

  if (!category)
    return message.reply("❌ Invalid option.");

  if ((category === "horny" || category === "18plus") && event.senderID !== "61588161951831")
    return message.reply("🚫 You are not authorized.");

  try {

    const BASE_API_URL = await getApiUrl();

    const res = await axios.get(`${BASE_API_URL}/album?type=${category}`);

    const media = res.data.data;

    if (!media)
      return message.reply("❌ Failed to load media.");

    const filePath = path.join(__dirname,"cache",`${Date.now()}.mp4`);

    const file = await axios.get(media,{responseType:"stream"});

    const writer = fs.createWriteStream(filePath);

    file.data.pipe(writer);

    writer.on("finish",()=>{

      message.reply({
        body:`✨ Here is your ${category} video`,
        attachment: fs.createReadStream(filePath)
      }, ()=> fs.unlinkSync(filePath));

    });

  } catch (err) {

    console.error(err);
    message.reply("❌ Something went wrong.");

  }

};