const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "top",
    version: "4.0",
    author: "Shourov Fix",
    role: 0,
    category: "economy",
    guide: "{p}top"
  },

  onStart: async function ({ message, usersData }) {

    const users = await usersData.getAll();

    users.sort((a,b)=> (b.money||0)-(a.money||0));

    const top = users.slice(0,10);

    const width = 900;
    const height = 600;

    const canvas = createCanvas(width,height);
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,width,height);

    // title
    ctx.font="bold 40px Arial";
    ctx.fillStyle="#ffffff";
    ctx.textAlign="center";
    ctx.fillText("TOP RICHEST USERS",width/2,60);

    const positions = [200,450,700];

    for(let i=0;i<3;i++){

      const avatarURL = await usersData.getAvatarUrl(top[i].userID);
      const avatar = await loadImage(avatarURL);

      const x = positions[i];

      ctx.save();

      ctx.beginPath();
      ctx.arc(x,180,70,0,Math.PI*2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar,x-70,110,140,140);

      ctx.restore();

      ctx.font="22px Arial";
      ctx.fillStyle="#00ffff";
      ctx.textAlign="center";

      ctx.fillText(`#${i+1}`,x,280);

      ctx.font="20px Arial";
      ctx.fillStyle="#ffffff";

      ctx.fillText(top[i].name || "Unknown",x,310);
      ctx.fillText(`${top[i].money || 0} $`,x,335);

    }

    ctx.textAlign="left";
    ctx.font="20px Arial";
    ctx.fillStyle="#ffffff";

    let y = 400;

    for(let i=3;i<top.length;i++){

      ctx.fillText(
        `${i+1}. ${top[i].name || "Unknown"} — ${top[i].money || 0} $`,
        120,
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