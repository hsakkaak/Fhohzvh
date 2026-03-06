const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "top",
    version: "3.0",
    author: "Shourov",
    role: 0,
    category: "economy",
    guide: "{p}top"
  },

  onStart: async function ({ message, usersData }) {

    const allUsers = await usersData.getAll();

    allUsers.sort((a,b)=> (b.money||0)-(a.money||0));

    const top = allUsers.slice(0,10);

    const width = 900;
    const height = 600;

    const encoder = new GIFEncoder(width,height);

    const cache = path.join(__dirname,"cache");
    if(!fs.existsSync(cache)) fs.mkdirSync(cache,{recursive:true});

    const filePath = path.join(cache,`top_${Date.now()}.gif`);

    encoder.createReadStream().pipe(fs.createWriteStream(filePath));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(120);

    const canvas = createCanvas(width,height);
    const ctx = canvas.getContext("2d");

    const avatars = [];

    for(let i=0;i<3;i++){
      avatars.push(await loadImage(await usersData.getAvatarUrl(top[i].userID)));
    }

    for(let frame=0;frame<15;frame++){

      ctx.fillStyle="#0f0f0f";
      ctx.fillRect(0,0,width,height);

      const glow = 6 + Math.sin(frame*0.3)*4;

      ctx.lineWidth = glow;
      ctx.strokeStyle="#00ffff";
      ctx.strokeRect(10,10,width-20,height-20);

      ctx.font="bold 40px Arial";
      ctx.fillStyle="#ffffff";

      const move = Math.sin(frame*0.3)*10;

      ctx.fillText("TOP RICHEST USERS",280+move,60);

      for(let i=0;i<3;i++){

        const x = 150 + i*250;

        ctx.beginPath();
        ctx.arc(x,200,70,0,Math.PI*2);
        ctx.clip();
        ctx.drawImage(avatars[i],x-70,130,140,140);
        ctx.restore();

        ctx.font="22px Arial";
        ctx.fillText(`#${i+1}`,x-10,300);

        ctx.font="18px Arial";
        ctx.fillText(top[i].name||"Unknown",x-80,330);

      }

      ctx.font="20px Arial";

      let y=380;

      for(let i=3;i<top.length;i++){
        ctx.fillText(`${i+1}. ${top[i].name} — ${top[i].money}`,120,y);
        y+=30;
      }

      encoder.addFrame(ctx);
    }

    encoder.finish();

    message.reply({
      body:"🏆 Richest Leaderboard",
      attachment:fs.createReadStream(filePath)
    },()=>fs.unlinkSync(filePath));
  }
};