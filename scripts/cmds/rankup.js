const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const deltaNext = global.GoatBot.configCommands.envCommands.rank.deltaNext;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);

module.exports = {
config:{
name:"rankup",
version:"2.1",
author:"Alihsan Shourov",
role:0,
category:"rank",
guide:{
en:"{pn} on / off"
}
},

// ON OFF COMMAND
onStart: async function ({ message, event, threadsData, args }) {

if(!["on","off"].includes(args[0]))
return message.reply("Use: rankup on / rankup off");

await threadsData.set(
event.threadID,
args[0] === "on",
"settings.sendRankupMessage"
);

return message.reply(
args[0] === "on"
? "✅ Level up banner ON"
: "❌ Level up banner OFF"
);

},

// LEVEL UP DETECT
onChat: async function({event, message, usersData, threadsData}){

let threadData = await threadsData.get(event.threadID);

// default ON
if(threadData.settings?.sendRankupMessage === undefined){
await threadsData.set(event.threadID,true,"settings.sendRankupMessage");
threadData.settings.sendRankupMessage = true;
}

if(!threadData.settings.sendRankupMessage) return;

const user = await usersData.get(event.senderID);

const currentLevel = expToLevel(user.exp);

if(currentLevel > expToLevel(user.exp-1)){

const name = user.name || "User";

const avatarURL = await usersData.getAvatarUrl(event.senderID);

const canvas = createCanvas(600,200);
const ctx = canvas.getContext("2d");

// gradient background
const grad = ctx.createLinearGradient(0,0,600,200);
grad.addColorStop(0,"#1e3c72");
grad.addColorStop(1,"#2a5298");

ctx.fillStyle = grad;
ctx.fillRect(0,0,600,200);

// avatar
const avatar = await loadImage(avatarURL);

ctx.save();
ctx.beginPath();
ctx.arc(100,100,60,0,Math.PI*2);
ctx.clip();
ctx.drawImage(avatar,40,40,120,120);
ctx.restore();

// glow border
ctx.beginPath();
ctx.arc(100,100,65,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=5;
ctx.stroke();

// text
ctx.font="bold 32px Arial";
ctx.fillStyle="#ffffff";

ctx.fillText("LEVEL UP!",200,80);

ctx.font="bold 26px Arial";
ctx.fillText(name,200,120);

ctx.font="22px Arial";
ctx.fillText("Level "+currentLevel,200,160);

// save banner
const cache = path.join(__dirname,"cache");

if(!fs.existsSync(cache))
fs.mkdirSync(cache,{recursive:true});

const bannerPath = path.join(cache,`rank_${Date.now()}.png`);

fs.writeFileSync(bannerPath,canvas.toBuffer());

return message.reply({

body:`🎉 ${name} reached level ${currentLevel}!`,

attachment:[
fs.createReadStream(bannerPath),
await global.utils.getStreamFromURL("https://files.catbox.moe/lxzpta.gif")
]

},()=>fs.unlinkSync(bannerPath));

}

}
};