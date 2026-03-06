const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

function formatMoney(num){
  if(!num) return "0";
  const units = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No"];
  let i = 0;
  while(num >= 1000 && i < units.length-1){
    num /= 1000;
    i++;
  }
  return num.toFixed(2).replace(/\.00$/,"")+" "+units[i];
}

module.exports = {
  config:{
    name:"top",
    version:"5.0",
    author:"Shourov",
    role:0,
    category:"economy",
    guide:"{p}top"
  },

  onStart: async function({message, usersData}){

    const users = await usersData.getAll();
    users.sort((a,b)=> (b.money||0)-(a.money||0));

    const top = users.slice(0,15);

    const width = 900;
    const height = 850; // bigger canvas

    const canvas = createCanvas(width,height);
    const ctx = canvas.getContext("2d");

    // gradient background
    const grad = ctx.createLinearGradient(0,0,900,850);
    grad.addColorStop(0,"#1f2937");
    grad.addColorStop(1,"#111827");

    ctx.fillStyle = grad;
    ctx.fillRect(0,0,width,height);

    // title
    ctx.font = "bold 42px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("TOP RICHEST USERS",width/2,70);

    const positions = [200,450,700];

    // TOP 3
    for(let i=0;i<3;i++){

      const avatarURL = await usersData.getAvatarUrl(top[i].userID);
      const avatar = await loadImage(avatarURL);

      const x = positions[i];

      ctx.save();

      ctx.beginPath();
      ctx.arc(x,180,75,0,Math.PI*2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar,x-75,105,150,150);

      ctx.restore();

      // glow border
      ctx.beginPath();
      ctx.arc(x,180,80,0,Math.PI*2);
      ctx.strokeStyle="#00ffff";
      ctx.lineWidth=6;
      ctx.stroke();

      ctx.font="bold 24px Arial";
      ctx.fillStyle="#00e5ff";

      ctx.fillText(`#${i+1}`,x,300);

      ctx.font="20px Arial";
      ctx.fillStyle="#ffffff";

      ctx.fillText(top[i].name || "Unknown",x,330);
      ctx.fillText(formatMoney(top[i].money)+" $",x,355);
    }

    // OTHER USERS
    ctx.textAlign="left";
    ctx.font="22px Arial";
    ctx.fillStyle="#ffffff";

    let y = 420;

    for(let i=3;i<top.length;i++){

      ctx.fillText(
        `${i+1}. ${top[i].name || "Unknown"} — ${formatMoney(top[i].money)} $`,
        150,
        y
      );

      y += 35;
    }

    const cache = path.join(__dirname,"cache");

    if(!fs.existsSync(cache))
      fs.mkdirSync(cache,{recursive:true});

    const filePath = path.join(cache,`top_${Date.now()}.png`);

    fs.writeFileSync(filePath,canvas.toBuffer());

    message.reply({
      body:"🏆 Richest Users Leaderboard",
      attachment:fs.createReadStream(filePath)
    },()=>fs.unlinkSync(filePath));

  }
};