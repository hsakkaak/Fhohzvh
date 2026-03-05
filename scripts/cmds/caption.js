module.exports.config = {
  name: "caption",
  version: "1.0.0",
  hasPermssion: 0,
  credits: (() => {
    const credit = "alihsan shourov";
    if (credit !== "alihsan shourov") {
      throw new Error("Credit mismatch. Please correct the credit!");
    }
    return credit;
  })(),
  description: "Sends random quotes with an image",
  category: "sad",
  usages: "image",
  cooldowns: 11,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.onStart = async function ({ api, event }) {
  const axios = require("axios");
  const request = require("request");
  const fs = require("fs-extra");

  // Random quotes
  const quotes = [
  "❝ জীবন সুন্দর যদি কারো মায়ায় না পড়ো 🙂💔 ❞",
        "❝ ভাঙা মন আর ভাঙা বিশ্বাস কখনো জোড়া লাগে না ❞",
        "❝ সে বলেছিলো ছাড়বে না… তাহলে চলে গেলো কেন? ❞",
        "❝ প্রয়োজন ছাড়া কেউ খোঁজ নেয় না… ❞",
        "❝ হাসতে হাসতে একদিন সবাইকে কাঁদিয়ে বিদায় নিবো 💔 ❞"
  ];

  // Random images
  const images = [
    "https://i.imgur.com/vnVjD6L.jpeg",
        "https://i.imgur.com/TG3rIiJ.jpeg",
        "https://i.imgur.com/CPK9lur.jpeg",
        "https://i.imgur.com/GggjGf9.jpeg",
        "https://i.imgur.com/xUNknmi.jpeg"
  ];

  // Select a random quote and image
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  // Save the image and send message
  const callback = () => {
    api.sendMessage(
      {
        body: `「 ${randomQuote} 」`,
        attachment: fs.createReadStream(__dirname + "/cache/ig_image.jpg")
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/cache/ig_image.jpg")
    );
  };

  // Download the image
  return request(encodeURI(randomImage))
    .pipe(fs.createWriteStream(__dirname + "/cache/ig_image.jpg"))
    .on("close", () => callback());
};