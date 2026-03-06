function formatExp(num) {
  if (!num) return "0";
  const units = ["", "K", "M", "B", "T"];
  let i = 0;
  while (num >= 1000 && i < units.length - 1) {
    num /= 1000;
    i++;
  }
  return num.toFixed(2).replace(/\.00$/, "") + units[i];
}

module.exports = {
 config: {
 name: "topexp",
 version: "2.0",
 author: "Alihsan Shourov",
 role: 0,
 category: "group",
 shortDescription: {
 en: "Top EXP Rank"
 },
 guide: {
 en: "{pn}topexp"
 }
 },

 onStart: async function ({ message, usersData }) {

 const allUsers = await usersData.getAll();

 const usersWithExp = allUsers.filter(user => user.exp > 0);

 if (!usersWithExp.length)
 return message.reply("❌ No users have EXP yet.");

 const top = usersWithExp
 .sort((a,b)=>b.exp-a.exp)
 .slice(0,20);

 const icons = ["👑","🥈","🥉","🏅","🏅","🏅","🏅","🏅","🏅","🏅",
 "🏅","🏅","🏅","🏅","🏅","🏅","🏅","🏅","🏅","🏅"];

 let msg = "";

 msg += "╔══════════════════════╗\n";
 msg += " 🌟 𝗧𝗢𝗣 𝟮𝟬 𝗘𝗫𝗣 𝗥𝗔𝗡𝗞 🌟\n";
 msg += "╚══════════════════════╝\n\n";

 top.forEach((user,index)=>{

 const name = user.name || "Unknown";
 const exp = formatExp(user.exp);

 msg += `${icons[index]} ${index+1}. ${name}\n`;
 msg += `      ⭐ EXP: ${exp}\n\n`;

 });

 msg += "━━━━━━━━━━━━━━━━━━━━━━\n";
 msg += "🔥 Keep chatting to level up!";

 message.reply(msg);

 }
};