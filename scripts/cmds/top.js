const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "top",
    version: "7.0",
    author: "Shourov Fix",
    role: 0,
    category: "economy"
  },

  onStart: async function ({ message, usersData }) {

    try {

      const allUsers = await usersData.getAll();

      if (!allUsers || allUsers.length === 0)
        return message.reply("❌ No user data found.");

      allUsers.sort((a,b)=>(b.money||0)-(a.money||0));

      const top = allUsers.slice(0,15);

      const width = 900;
      const height = 850;

      const canvas = createCanvas(width,height);
      const ctx = canvas.getContext("2d");

      // gradient background
      const grad = ctx.createLinearGradient(0,0,width,height);
      grad.addColorStop(0,"#1e3c72");
      grad.addColorStop(1,"#2a5298");

      ctx.fillStyle = grad;
      ctx.fillRect(0,0,width,height);

      ctx.font="bold 40px Arial";
      ctx.fillStyle="#fff";
      ctx.textAlign="center";
      ctx.fillText("TOP RICHEST USERS",width/2,70);

      const pos=[200,450,700];

      for(let i=0;i<3;i++){

        if(!top[i]) continue;

        const avatarURL = await usersData.getAvatarUrl(top[i].userID);
        const avatar = await loadImage(avatarURL);

        const x = pos[i];

        ctx.save();

        ctx.beginPath();
        ctx.arc(x,200,70,0,Math.PI*2);
        ctx.clip();

        ctx.drawImage(avatar,x-70,130,140,140);

        ctx.restore();

        ctx.beginPath();
        ctx.arc(x,200,75,0,Math.PI*2);
        ctx.strokeStyle="#00ffff";
        ctx.lineWidth=6;
        ctx.stroke();

        ctx.fillStyle="#fff";
        ctx.font="20px Arial";

        ctx.fillText(`#${i+1}`,x,300);
        ctx.fillText(top[i].name || "Unknown",x,330);
        ctx.fillText(`${top[i].money || 0} $`,x,355);
      }

      ctx.textAlign="left";
      ctx.font="22px Arial";
      ctx.fillStyle="#fff";

      let y=420;

      for(let i=3;i<top.length;i++){

        ctx.fillText(
          `${i+1}. ${top[i].name || "Unknown"} — ${top[i].money || 0} $`,
          150,
          y
        );

        y+=35;
      }

      const cache = path.join(__dirname,"cache");

      if(!fs.existsSync(cache))
        fs.mkdirSync(cache,{recursive:true});

      const filePath = path.join(cache,`top_${Date.now()}.png`);

      fs.writeFileSync(filePath,canvas.toBuffer());

      if(!fs.existsSync(filePath))
        return message.reply("❌ Image generate failed.");

      return message.reply({
        body:"🏆 Richest Users Leaderboard",
        attachment:fs.createReadStream(filePath)
      },()=>fs.unlinkSync(filePath));

    } catch(err){

      console.error("TOP COMMAND ERROR:",err);
      return message.reply("⚠️ Leaderboard failed.");

    }
  }
};