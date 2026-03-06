const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config:{
    name:"top",
    version:"6.0",
    author:"Shourov",
    role:0,
    category:"economy"
  },

  onStart: async function({message, usersData}){

    const users = await usersData.getAll();

    users.sort((a,b)=>(b.money||0)-(a.money||0));

    const top = users.slice(0,10);

    const width = 900;
    const height = 700;

    const encoder = new GIFEncoder(width,height);

    const cache = path.join(__dirname,"cache");

    if(!fs.existsSync(cache))
      fs.mkdirSync(cache,{recursive:true});

    const filePath = path.join(cache,`top_${Date.now()}.gif`);

    encoder.createReadStream().pipe(fs.createWriteStream(filePath));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(120);
    encoder.setQuality(10);

    const canvas = createCanvas(width,height);
    const ctx = canvas.getContext("2d");

    const avatars = [];

    for(let i=0;i<3;i++){
      avatars.push(await loadImage(await usersData.getAvatarUrl(top[i].userID)));
    }

    for(let frame=0; frame<15; frame++){

      // animated gradient background
      const grad = ctx.createLinearGradient(0,0,900,700);

      grad.addColorStop(0,"#0f2027");
      grad.addColorStop(0.5,"#203a43");
      grad.addColorStop(1,"#2c5364");

      ctx.fillStyle = grad;
      ctx.fillRect(0,0,width,height);

      const move = Math.sin(frame*0.3)*10;

      ctx.font="bold 42px Arial";
      ctx.fillStyle="#ffffff";
      ctx.textAlign="center";

      ctx.fillText("TOP RICHEST USERS",width/2 + move,70);

      const pos=[200,450,700];

      for(let i=0;i<3;i++){

        const x = pos[i];

        const pulse = 80 + Math.sin(frame*0.4)*6;

        ctx.beginPath();
        ctx.arc(x,200,pulse,0,Math.PI*2);
        ctx.strokeStyle="#00ffff";
        ctx.lineWidth=6;
        ctx.stroke();

        ctx.save();

        ctx.beginPath();
        ctx.arc(x,200,70,0,Math.PI*2);
        ctx.clip();

        ctx.drawImage(avatars[i],x-70,130,140,140);

        ctx.restore();

        ctx.font="22px Arial";
        ctx.fillStyle="#00e5ff";

        ctx.fillText(`#${i+1}`,x,310);

        ctx.font="20px Arial";
        ctx.fillStyle="#ffffff";

        ctx.fillText(top[i].name || "Unknown",x,340);
        ctx.fillText(`${top[i].money || 0} $`,x,365);
      }

      ctx.textAlign="left";

      let y=420;

      for(let i=3;i<top.length;i++){

        ctx.font="22px Arial";
        ctx.fillStyle="#ffffff";

        ctx.fillText(
          `${i+1}. ${top[i].name || "Unknown"} — ${top[i].money || 0} $`,
          150,
          y
        );

        y+=35;
      }

      encoder.addFrame(ctx);
    }

    encoder.finish();

    message.reply({
      body:"🏆 Richest Users Leaderboard",
      attachment:fs.createReadStream(filePath)
    },()=>fs.unlinkSync(filePath));

  }
};