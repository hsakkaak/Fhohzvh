const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
config:{
name:"topbal",
version:"5.0",
author:"Alihsan Shourov",
role:0,
category:"wallet"
},

onStart: async function({message,usersData}){

const users = await usersData.getAll();

const usersWithMoney = users.filter(u=>u.money>0);

if(!usersWithMoney.length)
return message.reply("❌ No users have money.");

const top = usersWithMoney
.sort((a,b)=>b.money-a.money)
.slice(0,10);

const width = 800;
const height = 720;

const cache = path.join(__dirname,"cache");
if(!fs.existsSync(cache)) fs.mkdirSync(cache,{recursive:true});

const filePath = path.join(cache,`topbal_${Date.now()}.gif`);

const encoder = new GIFEncoder(width,height);
const stream = encoder.createReadStream().pipe(fs.createWriteStream(filePath));

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(120);
encoder.setQuality(10);

const canvas = createCanvas(width,height);
const ctx = canvas.getContext("2d");

const avatarURL = await usersData.getAvatarUrl(top[0].userID);
const avatar = await loadImage(avatarURL);

// encoded text
const encoded = "UG93ZXJlZCBieSBBbGlobHNhbiBTaG91cm92";
const text = Buffer.from(encoded,"base64").toString("utf8");

for(let frame=0; frame<25; frame++){

// animated gradient background
const grad = ctx.createLinearGradient(
Math.sin(frame*0.2)*200,
0,
width,
height
);

grad.addColorStop(0,"#0f2027");
grad.addColorStop(0.5,"#203a43");
grad.addColorStop(1,"#2c5364");

ctx.fillStyle = grad;
ctx.fillRect(0,0,width,height);

// pulse border
const pulse = 80 + Math.sin(frame*0.3)*8;

ctx.beginPath();
ctx.arc(width/2,120,pulse,0,Math.PI*2);
ctx.strokeStyle="#00ffff";
ctx.lineWidth=6;
ctx.stroke();

// avatar
ctx.save();
ctx.beginPath();
ctx.arc(width/2,120,70,0,Math.PI*2);
ctx.clip();
ctx.drawImage(avatar,width/2-70,50,140,140);
ctx.restore();

// title
ctx.textAlign="center";
ctx.font="bold 32px Arial";
ctx.fillStyle="#ffffff";

ctx.fillText("💰 RICHEST USERS 💰",width/2,240);

// leaderboard
ctx.textAlign="left";
ctx.font="22px Arial";

let y=300;

const icons=["👑","🥈","🥉","🏅","🏅","🏅","🏅","🏅","🏅","🏅"];

for(let i=0;i<top.length;i++){

ctx.fillStyle="#ffffff";

ctx.fillText(
`${icons[i]} ${i+1}. ${top[i].name || "Unknown"} — ${top[i].money}$`,
120,
y
);

y+=35;

}

// decode typing effect
const visible = Math.min(frame,text.length);

ctx.textAlign="right";
ctx.font="18px Arial";
ctx.fillStyle="#00ffff";

ctx.fillText(
text.substring(0,visible),
width-20,
height-20
);

encoder.addFrame(ctx);

}

encoder.finish();

stream.on("finish",()=>{

message.reply({
body:"🏆 Richest Users Leaderboard",
attachment:fs.createReadStream(filePath)
},()=>fs.unlinkSync(filePath));

});

}
};