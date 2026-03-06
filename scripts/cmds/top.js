const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "top",
    version: "3.2",
    author: "alihsan Shourov",
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

    ctx.fillStyle="#0f0f0f";
    ctx.fillRect(0,0,width,height);

    ctx.font="bold 40px Arial";
    ctx.fillStyle="#ffffff";
    ctx.fillText("TOP RICHEST USERS",300,60);

    // Top 3 avatar
    const avatar1 = await loadImage(await usersData.getAvatarUrl(top[0].userID));
    const avatar2 = await loadImage(await usersData.getAvatarUrl(top[1].userID));
    const avatar3 = await loadImage(await usersData.getAvatarUrl(top[2].userID));

    const avatars = [avatar1,avatar2,avatar3];

    for(let i=0;i<3;i++){

      const x = 150 + i*300;

      ctx.beginPath();
      ctx.arc(x,170,70,0,Math.PI*2);
      ctx.clip();

      ctx.drawImage(avatars[i],x-70,100,140,140);

      ctx.restore();

      ctx.font="22px Arial";
      ctx.fillStyle="#00ffff";

      ctx.fillText(`#${i+1}`,x-10,260);

      ctx.font="20px Arial";
      ctx.fillStyle="#ffffff";

      ctx.fillText(top[i].name||"Unknown",x-90,290);

      ctx.fillText(`${top[i].money}`,x-40,320);

    }

    ctx.font="20px Arial";

    let y=380;

    for(let i=3;i<top.length;i++){

      ctx.fillText(`${i+1}. ${top[i].name} — ${top[i].money}`,120,y);

      y+=35;
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