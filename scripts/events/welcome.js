const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// encoded owner name
const encodedOwner = "QWxpaHNhbiBTaG91cm92";

function decodeOwner() {
  return Buffer.from(encodedOwner, "base64").toString("utf8");
}

// preload font
(async () => {
  try {

    const fontPath = path.join(__dirname,"cache","font.ttf");

    if(!fs.existsSync(fontPath)){

      const fontUrl =
      "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf";

      const {data} = await axios.get(fontUrl,{responseType:"arraybuffer"});

      await fs.outputFile(fontPath,data);
    }

    registerFont(fontPath,{family:"Poppins"});

  } catch(e){
    console.log("Font error",e);
  }
})();

module.exports = {

config:{
name:"welcome",
version:"8.0",
author:"Alihsan Shourov",
category:"events"
},

onStart: async function({threadsData,event,api,usersData}){

try{

const {threadID,logMessageType,logMessageData}=event;

const botID = api.getCurrentUserID();

const addedParticipants = logMessageData.addedParticipants || [];

// BOT ADDED MESSAGE
if (
logMessageType === "log:subscribe" &&
addedParticipants.some(p => p.userFbId === botID)
){

const nickname = global.GoatBot?.config?.nickNameBot || "Bot";

await api.changeNickname(nickname,threadID,botID);

const msg = `
━━━━━━━━━━━━━━━━━━━━━━
☔ ${nickname} CONNECTED
━━━━━━━━━━━━━━━━━━━━━━

👑 BOT OWNER
➤ 𝐀𝐋𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕

🌐 FACEBOOK
➤ facebook.com/shourov.sm24

📱 WHATSAPP
➤ wa.me/+8801709281334

━━━━━━━━━━━━━━━━━━━━━━
`;

const onlineImage =
await global.utils.getStreamFromURL(
"https://files.catbox.moe/67v8il.gif"
);

await api.sendMessage({
body:msg,
attachment:onlineImage
},threadID);

return;
}

// NORMAL USER JOIN
if(logMessageType!=="log:subscribe") return;

const threadData = await threadsData.get(threadID);

const threadName = threadData.threadName || "Group";

const memberCount =
(await api.getThreadInfo(threadID)).participantIDs.length;

const user = addedParticipants[0];
const userName = user.fullName;
const userID = user.userFbId;

// avatars
const avatarUrl = await usersData.getAvatarUrl(userID);
const avatar = await loadImage(avatarUrl);

const adderID = event.author;

const adderInfo = await api.getUserInfo(adderID);
const adderName = adderInfo[adderID]?.name || "Unknown";

const adderAvatarUrl = await usersData.getAvatarUrl(adderID);
const adderAvatar = await loadImage(adderAvatarUrl);

// canvas
const width = 1000;
const height = 550;

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

// gradient background
const grad = ctx.createLinearGradient(0,0,width,height);

grad.addColorStop(0,"#0f2027");
grad.addColorStop(0.5,"#203a43");
grad.addColorStop(1,"#2c5364");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// particle stars
for(let i=0;i<70;i++){

const x = Math.random()*width;
const y = Math.random()*height;
const r = Math.random()*2;

ctx.beginPath();
ctx.arc(x,y,r,0,Math.PI*2);
ctx.fillStyle="rgba(255,255,255,0.4)";
ctx.fill();

}

// pulse animation
const pulse = Math.sin(Date.now()/200)*8;

// main avatar
ctx.save();
ctx.beginPath();
ctx.arc(500,180,90,0,Math.PI*2);
ctx.clip();

ctx.drawImage(avatar,410,90,180,180);

ctx.restore();

// neon pulse borders
ctx.shadowColor="#ff0000";
ctx.shadowBlur=40;

ctx.beginPath();
ctx.arc(500,180,100+pulse,0,Math.PI*2);
ctx.strokeStyle="#ff0000";
ctx.lineWidth=5;
ctx.stroke();

ctx.shadowColor="#00ffff";
ctx.shadowBlur=40;

ctx.beginPath();
ctx.arc(500,180,95+pulse,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=6;
ctx.stroke();

ctx.shadowBlur=0;

// adder avatar bottom
ctx.save();
ctx.beginPath();
ctx.arc(500,420,60,0,Math.PI*2);
ctx.clip();

ctx.drawImage(adderAvatar,440,360,120,120);

ctx.restore();

ctx.beginPath();
ctx.arc(500,420,65,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=4;
ctx.stroke();

// glowing title
ctx.textAlign="center";

ctx.shadowColor="#00ffff";
ctx.shadowBlur=30;

ctx.font="bold 65px Poppins";
ctx.fillStyle="#ffffff";
ctx.fillText("WELCOME",500,340);

ctx.shadowBlur=0;

// user name
ctx.font="bold 35px Poppins";
ctx.fillStyle="#00ffcc";
ctx.fillText(userName,500,390);

// added by
ctx.font="bold 25px Poppins";
ctx.fillStyle="#ffd700";
ctx.fillText("Added by "+adderName,500,460);

// scrolling owner
const owner = decodeOwner();

ctx.font="bold 22px Poppins";
ctx.fillStyle="#ffffff";

const offset = (Date.now()/10)%width;

ctx.fillText(owner,width-offset,530);

// save image
const imgPath = path.join(__dirname,"cache",`welcome_${userID}.png`);

await fs.ensureDir(path.dirname(imgPath));

fs.writeFileSync(imgPath,canvas.toBuffer("image/png"));

// body
const body = `
╔══════ ✦ WELCOME ✦ ══════╗

🌸 Assalamu Alaikum 🌸

✨ NEW MEMBER
➤ ${userName}

🎉 Welcome to
➤ ${threadName}

👥 Member
➤ ${memberCount}

━━━━━━━━━━━━━━━━━━
`;

await api.sendMessage({
body,
attachment:fs.createReadStream(imgPath)
},
threadID,
()=>fs.unlinkSync(imgPath)
);

}catch(err){

console.log("Welcome error",err);

}

}

};