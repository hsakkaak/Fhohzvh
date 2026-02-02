const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		if (
			global.GoatBot.config.antiInbox == true &&
			(event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
			(event.senderID || event.userID || event.isGroup == false)
		)
			return;

		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);
		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const {
			onAnyEvent, onFirstChat, onStart, onChat,
			onReply, onEvent, handlerEvent, onReaction,
			typ, presence, read_receipt
		} = handlerChat;


		onAnyEvent();
		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;
			case "event":
				handlerEvent();
				onEvent();
				break;
			case "message_reaction":
				onReaction();

				// ১. নির্দিষ্ট ইউজার 🚫 রিঅ্যাকশন দিলে গ্রুপ থেকে কিক মারবে
				if (event.reaction == "🚫") {
					if (event.userID == "100071971474157") {
						api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
							if (err) return console.log(err);
						});
					}
				}

				// ২. বটের মেসেজে নির্দিষ্ট আইডি রাগী ইমোজি দিলে মেসেজ আনসেন্ড (Remove) হবে
				if (["😾", "👎"].includes(event.reaction)) {
					if (event.senderID == api.getCurrentUserID()) {
						// আপনার দেওয়া নতুন আইডিটি এখানে যুক্ত করা হয়েছে
						const targetIDs = ["100071971474157"];
						if (targetIDs.includes(event.userID)) {
							message.unsend(event.messageID);
						}
					}
				}

				// ৩. বটের মেসেজে নির্দিষ্ট আইডি 😒 দিলে বট মেসেজটি এডিট করবে
				if (event.reaction == "😒") {
					if (event.senderID == api.getCurrentUserID()) {
						// শুধুমাত্র এই আইডিটি এডিট করতে পারবে
						if (event.userID == "100071971474157") {
							api.editMessage("😒", event.messageID);
						}
					}
				}
				break;
				
			case "typ":
				typ();
				break;
			case "presence":
				presence();
				break;
			case "read_receipt":
				read_receipt();
				break;
			default:
				break;
		}
	};
};
