const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {

config:{
name:"welcome",
version:"10.0",
author:"Alihsan Shourov",
category:"events"
},

onStart: async function({threadsData,event,api,usersData}){

try{

const {threadID,logMessageType,logMessageData}=event;

const botID = api.getCurrentUserID();

const addedParticipants = logMessageData.addedParticipants || [];

// BOT ADDED MESSAGE
if(
logMessageType==="log:subscribe" &&
addedParticipants.some(p=>p.userFbId===botID)
){

const ownerID = "100081816009903"; // owner uid

const ownerInfo = await api.getUserInfo(ownerID);

const ownerName = ownerInfo[ownerID].name;

const ownerAvatar =
`https://graph.facebook.com/${ownerID}/picture?height=720&width=720`;

const ownerImage = await axios.get(ownerAvatar,{responseType:"stream"});

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
attachment:ownerImage.data

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
encoder.setDelay(80);
encoder.setQuality(10);

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

for(let frame=0;frame<30;frame++){

// animated background
const grad = ctx.createLinearGradient(
Math.sin(frame*0.2)*200,
0,
width,
height
);

grad.addColorStop(0,"#0f2027");
grad.addColorStop(1,"#2c5364");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// stars
for(let i=0;i<40;i++){

ctx.beginPath();

ctx.arc(
Math.random()*width,
Math.random()*height,
2,
0,
Math.PI*2
);

ctx.fillStyle="rgba(255,255,255,0.4)";
ctx.fill();

}

// pulse border
const pulse = 80 + Math.sin(frame*0.4)*6;

// adder avatar (left)
ctx.save();
ctx.beginPath();
ctx.arc(300,120,70,0,Math.PI*2);
ctx.clip();
ctx.drawImage(adderAvatar,230,50,140,140);
ctx.restore();

ctx.beginPath();
ctx.arc(300,120,pulse,0,Math.PI*2);
ctx.strokeStyle="#ff0000";
ctx.lineWidth=5;
ctx.stroke();

// member avatar (right)
ctx.save();
ctx.beginPath();
ctx.arc(600,120,70,0,Math.PI*2);
ctx.clip();
ctx.drawImage(avatar,530,50,140,140);
ctx.restore();

ctx.beginPath();
ctx.arc(600,120,pulse,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=5;
ctx.stroke();

// arrow
ctx.font="bold 60px Arial";
ctx.fillStyle="#ffffff";
ctx.textAlign="center";
ctx.fillText("➜",450,140);

// welcome text
ctx.font="bold 50px Arial";
ctx.fillText("WELCOME",450,250);

// sliding name
const move = Math.sin(frame*0.3)*40;

ctx.font="bold 32px Arial";
ctx.fillStyle="#00ffff";
ctx.fillText(userName,450+move,300);

// added by
ctx.font="bold 22px Arial";
ctx.fillStyle="#ffd700";
ctx.fillText("Added by "+adderName,450,340);

// owner
ctx.font="20px Arial";
ctx.fillStyle="#ffffff";
ctx.fillText("Owner: Alihsan Shourov",450,400);

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