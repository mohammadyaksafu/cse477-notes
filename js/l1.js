/* Lecture 1-2: authentication factor sorter + checksum lab */
(function () {
  const { $, esc } = window.INS;
  const items = [
    ["🔢 PIN", "know"], ["👆 Fingerprint", "are"], ["💳 Smart card", "have"], ["📱 OTP-আসা মোবাইল", "have"],
    ["🔑 Password", "know"], ["🙂 Face ID", "are"], ["🚗 Key fob", "have"], ["❓ নিরাপত্তা প্রশ্নের উত্তর", "know"], ["👁️ Iris scan", "are"]
  ];
  const label = { know: "🧠 Something you KNOW", have: "🔑 Something you HAVE", are: "👆 Something you ARE" };
  const wrap = $("#factorBtns");
  items.forEach(([name, f]) => {
    const b = document.createElement("button"); b.className = "btn ghost"; b.type = "button"; b.textContent = name;
    b.addEventListener("click", () => { $("#factorOut").innerHTML = esc(name) + "  →  <span class='good'>" + label[f] + "</span>"; });
    wrap.appendChild(b);
  });

  function ck() {
    const t = $("#ck").value;
    let sum = 0; for (const ch of new TextEncoder().encode(t)) sum = (sum + ch) % 256;
    $("#ckOut").innerHTML = "সরল যোগফল checksum = " + sum + "\nSHA-256          = " + window.sha256(t);
  }
  $("#ck").addEventListener("input", ck); ck();
})();
