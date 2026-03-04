// UID ধরার জন্য
const urlParams = new URLSearchParams(window.location.search);
const UID = urlParams.get("uid");

// OWNER CHECK
const IS_OWNER = UID === "100071971474157";
// 1️⃣ সব command আনতেছি
fetch("/api/commands")
.then(res => res.json())
.then(commands => {

  const box = document.getElementById("cmds");

  // 2️⃣ এক এক করে checkbox বানাচ্ছি
  commands.forEach(cmd => {
    box.innerHTML += `
      <label>
        <input type="checkbox"
          ${cmd.enabled ? "checked" : ""}
          onchange="toggleCommand('${cmd.name}', this.checked)">
        ${cmd.name}
      </label>
      <br>
    `;
  });

});