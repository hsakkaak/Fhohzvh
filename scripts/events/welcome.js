const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// encoded owner name
const ownerEncoded = "QWxpaHNhbiBTaG91cm92";

function getOwner(){
return Buffer.from(ownerEncoded,"base64").toString("utf8");
}

module.exports = {
config:{
name:"welcome",
version:"12.1",
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

const width = 700;
const height = 350;

const encoder = new GIFEncoder(width,height);

const filePath = path.join(__dirname,"cache",`welcome_${userID}.gif`);

await fs.ensureDir(path.dirname(filePath));

const stream = encoder.createReadStream();

const writeStream = fs.createWriteStream(filePath);

stream.pipe(writeStream);

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(20);

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

for(let frame=0; frame<18; frame++){

// moving background
const grad = ctx.createLinearGradient(
frame*20,
0,
width,
height
);

grad.addColorStop(0,"#0f2027");
grad.addColorStop(1,"#2c5364");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// stars
for(let i=0;i<25;i++){

ctx.beginPath();

ctx.arc(
Math.random()*width,
Math.random()*height,
1.5,
0,
Math.PI*2
);

ctx.fillStyle="rgba(255,255,255,0.5)";
ctx.fill();

}

// pulse border
const pulse = 65 + Math.sin(frame*0.5)*10;

// LEFT avatar
ctx.save();
ctx.beginPath();
ctx.arc(200,80,55,0,Math.PI*2);
ctx.clip();
ctx.drawImage(adderAvatar,145,25,110,110);
ctx.restore();

ctx.beginPath();
ctx.arc(200,80,pulse,0,Math.PI*2);
ctx.strokeStyle="#ff0000";
ctx.lineWidth=5;
ctx.stroke();

// RIGHT avatar
ctx.save();
ctx.beginPath();
ctx.arc(500,80,55,0,Math.PI*2);
ctx.clip();
ctx.drawImage(avatar,445,25,110,110);
ctx.restore();

ctx.beginPath();
ctx.arc(500,80,pulse,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=5;
ctx.stroke();

// arrow
ctx.font="bold 55px Arial";
ctx.fillStyle="#ffffff";
ctx.textAlign="center";
ctx.fillText("➜",350,90);

// welcome text
ctx.font="bold 40px Arial";
ctx.fillText("WELCOME",350,180);

// sliding name
const slide = Math.sin(frame*0.4)*50;

ctx.font="bold 26px Arial";
ctx.fillStyle="#00ffff";
ctx.fillText(userName,350+slide,220);

// added by
ctx.font="bold 18px Arial";
ctx.fillStyle="#ffd700";
ctx.fillText("Added by "+adderName,350,250);

// owner decoded
ctx.font="16px Arial";
ctx.fillStyle="#ffffff";
ctx.fillText("Owner: "+getOwner(),350,300);

encoder.addFrame(ctx);

}

encoder.finish();

writeStream.on("finish", async ()=>{

await api.sendMessage({

body:`✨ Welcome ${userName} to ${threadName}`,

attachment:fs.createReadStream(filePath)

},

threadID,

()=>fs.unlinkSync(filePath)

);

});

}catch(err){

console.log("Welcome error",err);

}

}

};