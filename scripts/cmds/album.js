const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

const API_CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";

const ownerEncoded = "QWxpaHNhbiBTaG91cm92";
function getOwner(){
return Buffer.from(ownerEncoded,"base64").toString("utf8");
}

const getApiUrl = async () => {
const res = await axios.get(API_CONFIG_URL);
return res.data.album;
};

module.exports.config = {
name: "album",
version: "7.0",
author: "Ullash + Shourov UI Pro",
countDown: 5,
role: 0,
category: "Media"
};

const page1 = ["funny","islamic","sad","anime","cartoon","love","horny","couple","flower","marvel"];
const page2 = ["aesthetic","sigma","lyrics","cat","18plus","freefire","football","girl","friends","cricket"];

async function createMenu(list,page){

const width = 900;
const height = 620;

const encoder = new GIFEncoder(width,height);
const filePath = path.join(__dirname,"cache","album_menu.gif");

await fs.ensureDir(path.dirname(filePath));

const stream = encoder.createReadStream();
const writeStream = fs.createWriteStream(filePath);
stream.pipe(writeStream);

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(90);
encoder.setQuality(10);

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

for(let frame=0; frame<30; frame++){

// gradient background
const grad = ctx.createLinearGradient(0,0,width,height);
grad.addColorStop(0,"#0c1c3a");
grad.addColorStop(0.5,"#003b2f");
grad.addColorStop(1,"#05172b");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// pulse animation
const pulse = Math.sin(frame*0.4)*5;

// MAIN BORDER (green)
ctx.lineWidth = 6;
ctx.strokeStyle="#00ff88";
ctx.shadowColor="#00ff88";
ctx.shadowBlur=20;
ctx.strokeRect(8-pulse,8-pulse,width-16+(pulse*2),height-16+(pulse*2));
ctx.shadowBlur=0;

// TITLE BOX (yellow)
ctx.strokeStyle="#ffd500";
ctx.lineWidth=4;
ctx.strokeRect(60,20,780,80);

// CATEGORY BOX (blue)
ctx.strokeStyle="#00aaff";
ctx.lineWidth=4;
ctx.strokeRect(60,120,780,350);

// OWNER BOX (yellow)
ctx.strokeStyle="#ffd500";
ctx.lineWidth=4;
ctx.strokeRect(260,500,380,60);

// title text
ctx.textAlign="center";
ctx.fillStyle="#00ff88";
ctx.font="bold 28px Arial";
ctx.fillText("💫 CHOOSE AN ALBUM CATEGORY BABY 💫",width/2,60);

ctx.fillStyle="#ffffff";
ctx.font="18px Arial";
ctx.fillText("✺━━━━━━━◈◉◈━━━━━━━✺",width/2,95);

// categories
let y = 160;

ctx.font="bold 22px Arial";

list.forEach((cat,i)=>{

ctx.fillStyle="#ff4040";
ctx.fillText(`✨ | ${i+1}. ${cat}`,width/2,y);
y+=30;

});

// page section
ctx.fillStyle="#00aaff";
ctx.font="20px Arial";

ctx.fillText("✺━━━━━━━◈◉◈━━━━━━━✺",width/2,410);
ctx.fillText(`🎯 | Page [${page}/2]`,width/2,435);

if(page==1)
ctx.fillText("ℹ | Type: /album 2 - next page",width/2,460);
else
ctx.fillText("ℹ | Type: /album - previous page",width/2,460);

ctx.fillText("✺━━━━━━━◈◉◈━━━━━━━✺",width/2,485);

// owner
ctx.fillStyle="#ffd500";
ctx.font="bold 20px Arial";
ctx.fillText(`Owner: ${getOwner()}`,width/2,540);

encoder.addFrame(ctx);

}

encoder.finish();
await new Promise(resolve => writeStream.on("finish", resolve));

return filePath;
}

module.exports.onStart = async function({message,event,args}){

const senderID = event.senderID;

if(args[0]=="2"){

const banner = await createMenu(page2,2);

return message.reply({
attachment: fs.createReadStream(banner)
},(err,info)=>{

global.GoatBot.onReply.set(info.messageID,{
commandName:"album",
author:senderID,
categories:page2,
page:2
});

});

}

const banner = await createMenu(page1,1);

return message.reply({
attachment: fs.createReadStream(banner)
},(err,info)=>{

global.GoatBot.onReply.set(info.messageID,{
commandName:"album",
author:senderID,
categories:page1,
page:1
});

});

};

module.exports.onReply = async function({message,event,Reply}){

if(event.senderID!==Reply.author)
return message.reply("❌ Only menu opener can select.");

let num=parseInt(event.body);

if(isNaN(num))
return message.reply("❌ Reply with a number.");

if(num<1||num>Reply.categories.length)
return message.reply("❌ Invalid option.");

const category = Reply.categories[num-1];
const adminID="61588161951831";

if((category=="horny"||category=="18plus") && event.senderID!==adminID)
return message.reply("🚫 You are not authorized.");

try{

const BASE_API_URL = await getApiUrl();
const res = await axios.get(`${BASE_API_URL}/album?type=${category}`);

const media = res.data.data;
const filePath = path.join(__dirname,"cache",`${Date.now()}.mp4`);

const file = await axios.get(media,{responseType:"stream"});
const writer = fs.createWriteStream(filePath);

file.data.pipe(writer);

writer.on("finish",()=>{

message.reply({
body:`✨ Here is your ${category} video`,
attachment: fs.createReadStream(filePath)
},()=>fs.unlinkSync(filePath));

});

}catch(e){

console.log(e);
message.reply("❌ Something went wrong.");

}

};