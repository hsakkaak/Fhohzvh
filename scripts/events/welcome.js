const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
config:{
name:"welcome",
version:"12.0",
author:"Alihsan Shourov",
category:"events"
},

onStart: async function({event,api,usersData,threadsData}){

try{

const {threadID,logMessageType,logMessageData}=event;

const botID = api.getCurrentUserID();

const addedParticipants = logMessageData.addedParticipants || [];

// BOT ADDED MESSAGE
if(
logMessageType==="log:subscribe" &&
addedParticipants.some(p=>p.userFbId===botID)
){

const ownerID = "100081816009903";

const ownerInfo = await api.getUserInfo(ownerID);

const ownerName = ownerInfo[ownerID].name;

const ownerAvatar = await axios.get(
`https://graph.facebook.com/${ownerID}/picture?height=720&width=720`,
{responseType:"stream"}
);

const msg = `
━━━━━━━━━━━━━━━━━━
🤖 BOT CONNECTED
━━━━━━━━━━━━━━━━━━

👑 OWNER
${ownerName}

🌐 FACEBOOK
facebook.com/shourov.sm24

📱 WHATSAPP
wa.me/+8801709281334

━━━━━━━━━━━━━━━━━━
`;

await api.sendMessage({
body:msg,
attachment:ownerAvatar.data
},threadID);

return;

}

// MEMBER JOIN
if(logMessageType!=="log:subscribe") return;

const threadData = await threadsData.get(threadID);

const threadName = threadData.threadName || "Group";

const user = addedParticipants[0];

const userName = user.fullName;

const userID = user.userFbId;

const adderID = event.author;

const adderInfo = await api.getUserInfo(adderID);

const adderName = adderInfo[adderID]?.name || "Unknown";

// avatars
const avatar = await loadImage(await usersData.getAvatarUrl(userID));

const adderAvatar = await loadImage(await usersData.getAvatarUrl(adderID));

const width = 900;
const height = 450;

const encoder = new GIFEncoder(width,height);

const filePath = path.join(__dirname,"cache",`welcome_${userID}.gif`);

encoder.createReadStream().pipe(fs.createWriteStream(filePath));

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(90);
encoder.setQuality(10);

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

for(let frame=0; frame<40; frame++){

// moving gradient background
const shift = frame*20;

const grad = ctx.createLinearGradient(
0+shift,
0,
width,
height
);

grad.addColorStop(0,"#0f2027");
grad.addColorStop(1,"#2c5364");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// stars
for(let i=0;i<50;i++){

ctx.beginPath();

ctx.arc(
Math.random()*width,
Math.random()*height,
2,
0,
Math.PI*2
);

ctx.fillStyle="rgba(255,255,255,0.5)";
ctx.fill();

}

// pulse border
const pulse = 75 + Math.sin(frame*0.3)*12;

// LEFT avatar (adder)
ctx.save();
ctx.beginPath();
ctx.arc(250,100,70,0,Math.PI*2);
ctx.clip();
ctx.drawImage(adderAvatar,180,30,140,140);
ctx.restore();

ctx.beginPath();
ctx.arc(250,100,pulse,0,Math.PI*2);
ctx.strokeStyle="#ff0000";
ctx.lineWidth=6;
ctx.stroke();

// RIGHT avatar (new member)
ctx.save();
ctx.beginPath();
ctx.arc(650,100,70,0,Math.PI*2);
ctx.clip();
ctx.drawImage(avatar,580,30,140,140);
ctx.restore();

ctx.beginPath();
ctx.arc(650,100,pulse,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=6;
ctx.stroke();

// arrow middle
ctx.font="bold 70px Arial";
ctx.fillStyle="#ffffff";
ctx.textAlign="center";
ctx.fillText("➜",450,115);

// welcome text
ctx.font="bold 55px Arial";
ctx.fillText("WELCOME",450,230);

// sliding username
const slide = Math.sin(frame*0.25)*70;

ctx.font="bold 34px Arial";
ctx.fillStyle="#00ffff";
ctx.fillText(userName,450+slide,280);

// added by text
ctx.font="bold 24px Arial";
ctx.fillStyle="#ffd700";
ctx.fillText("Added by "+adderName,450,320);

// owner text
ctx.font="20px Arial";
ctx.fillStyle="#ffffff";
ctx.fillText("Owner: Alihsan Shourov",450,380);

encoder.addFrame(ctx);

}

encoder.finish();

await api.sendMessage({

body:`✨ Welcome ${userName} to ${threadName}`,

attachment:fs.createReadStream(filePath)

},

threadID,

()=>fs.unlinkSync(filePath)

);

}catch(err){

console.log("Welcome error",err);

}

}

};