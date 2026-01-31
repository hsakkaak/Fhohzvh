// 🤖 AI Chat Test API
app.post("/api/test-chat", requireLogin, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "❌ Empty message" });

  try {
    // Fake message object (bot test)
    const fakeEvent = {
      body: message,
      senderID: "dashboard-user",
      threadID: "dashboard-test",
      isGroup: false
    };

    // যদি GoatBot command system থাকে
    if (global.GoatBot?.onChat) {
      for (const fn of global.GoatBot.onChat) {
        await fn({
          event: fakeEvent,
          api: {
            sendMessage: (msg) => {
              res.json({ reply: msg });
            }
          }
        });
        return;
      }
    }

    // fallback
    res.json({ reply: "⚠️ Bot handler not ready" });

  } catch (e) {
    res.json({ reply: "❌ Error: " + e.message });
  }
});