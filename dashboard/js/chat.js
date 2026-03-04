const chatBox = document.getElementById("chatBox");

function add(msg, from) {
  const div = document.createElement("div");
  div.className = from === "me"
    ? "text-right text-cyan-400"
    : "text-left text-green-400";
  div.innerText = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  add("🧑‍💻 " + text, "me");
  input.value = "";

  const res = await fetch("/api/test-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  add("🤖 " + data.reply, "bot");
}