module.exports = {
        config: {
                name: "goiadmin",
                author: "Chitron Bhattacharjee",
                role: 0,
                shortDescription: " ",
                longDescription: "",
                category: "BOT",
                guide: "{pn}"
        },

onChat: function({ api, event }) {
        if (event.senderID !== "100071971474157") {
                var aid = ["100071971474157","100071971474157"];
                for (const id of aid) {
                if (Object.keys(event.mentions).includes(id)) {
                        var msg = ["কিরে তোর প্রোবলেম কি😒আমার বস কে মেনসন দিস কেন 🫰🏻🧛‍♀️মেনসন না দিয়ে আমার বসের জন্য সুন্দর দেইখা একটা বউ খুজে দে🫰🏻😊। 🦆 "];
                        return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
                }
                }}
},
onStart: async function({}) {
        }
};
