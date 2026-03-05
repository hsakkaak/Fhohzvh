const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

// 🔤 Register Bangla Font (Regular)
registerFont(
  path.join(__dirname, "fonts/NotoSansBengali-Regular.ttf"),
  { family: "BanglaRegular" }
);

module.exports = {
  config: {
    name: "board",
    aliases: ["brd"],
    version: "1.1",
    author: "Alihsan Shourov",
    role: 0,
    shortDescription: "Write Bangla text on board",
    longDescription: "Person holding board with Bangla text",
    category: "fun",
    guide: "/board <বাংলা লেখা>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return api.sendMessage(
          "❌ লেখা দিন\nউদাহরণ: /board আমি বাংলায় লিখি",
          event.threadID,
          event.messageID
        );
      }

      const canvas = createCanvas(800, 800);
      const ctx = canvas.getContext("2d");

      // 🖼 Background (person holding board)
      const bg = await loadImage(
        "https://files.catbox.moe/mspgp7.png"
      );
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // ✍️ Bangla text style
      ctx.font = "bold 44px BanglaRegular";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // ⬇️ Text একটু নিচে নামানো
      const textX = canvas.width / 2;
      const textY = 480; // ← আগের চেয়ে নিচে

      // Multi-line support
      wrapText(ctx, text, textX, textY, 500, 52);

      // 💾 Save image
      const outPath = path.join(__dirname, "board_output.png");
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await api.sendMessage(
        {
          body: "🪧 বোর্ড প্রস্তুত!",
          attachment: fs.createReadStream(outPath)
        },
        event.threadID,
        () => fs.unlinkSync(outPath)
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ বোর্ড তৈরি করতে সমস্যা হয়েছে",
        event.threadID
      );
    }
  }
};

// 🔧 Text wrap function (Bangla safe)
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y + offsetY);
      line = words[n] + " ";
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + offsetY);
}
