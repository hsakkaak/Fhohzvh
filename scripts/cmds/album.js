const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

const API_CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";

// owner encoded
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
version: "5.1",
author: "Ullash + Fixed by Shourov",
countDown: 5,
role: 0,
category: "Media"
};

const page1 = ["funny","islamic","sad","anime","cartoon","love","horny","couple","flower","marvel"];
const page2 = ["aesthetic","sigma","lyrics","cat","18plus","freefire","football","girl","friends","cricket"];

async function createMenu(list,page){

const width = 900;
const height = 600;

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

const grad = ctx.createLinearGradient(frame*20,0,width,height);

grad.addColorStop(0,"#000000");
grad.addColorStop(1,"#002c2c");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// border
ctx.lineWidth = 8;
ctx.strokeStyle="#00ff00";
ctx.shadowColor="#00ff00";
ctx.shadowBlur=20;
ctx.strokeRect(10,10,width-20,height-20);

ctx.shadowBlur=0;

// title
ctx.textAlign="center";
ctx.shadowColor="#00ff00";
ctx.shadowBlur=25;

ctx.fillStyle="#00ff88";
ctx.font="bold 40px Arial";

ctx.fillText("💫 CHOOSE AN ALBUM CATEGORY BABY 💫",width/2,80);

ctx.shadowBlur=0;

// categories
let y = 170;

list.forEach((cat,i)=>{

ctx.shadowColor="#ff0000";
ctx.shadowBlur=20;

ctx.fillStyle="#ff4040";
ctx.font="bold 26px Arial";

ctx.fillText(`● ${i+1}. SELECT ➤ ALBUM ➤ ${cat}`,width/2,y);

y+=40;

});

ctx.shadowBlur=0;

// page
ctx.shadowColor="#00ff00";
ctx.shadowBlur=20;

ctx.fillStyle="#00ff88";
ctx.font="24px Arial";

ctx.fillText(`🎯 Page [${page}/2]`,width/2,500);

if(page==1)
ctx.fillText("Type: /album 2 - next page",width/2,540);
else
ctx.fillText("Type: /album - previous page",width/2,540);

// owner
ctx.fillText(`Owner: ${getOwner()}`,width/2,580);

encoder.addFrame(ctx);

}

encoder.finish();

// wait until file finished
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