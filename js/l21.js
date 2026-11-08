/* Lecture 21: ISN prediction, smurf amplification, SYN flood + SYN cookie */
(function () {
  const { $ } = window.INS;
  const rnd = () => (crypto.getRandomValues(new Uint32Array(1))[0] >>> 0);

  /* ---- sequence prediction ---- */
  let next = null;
  $("#observe").addEventListener("click", () => {
    const mode = $("#isn").value, seen = [];
    let base = 1000 + (rnd() % 9000);
    for (let i = 0; i < 3; i++) seen.push(mode === "ctr" ? base + i : rnd());
    next = mode === "ctr" ? base + 3 : rnd();
    $("#obs").textContent = "তুমি নিজে server-এ ৩বার connect করে দেখলে SYN-ACK-এর seq:\n  " + seen.join(", ") + "\n\nএবার victim সেজে পরের connection-এর seq আন্দাজ করো (ACK = seq+1, এখানে শুধু seq লিখলেই হবে)।";
    $("#tres").textContent = ""; $("#guess").value = "";
  });
  $("#try").addEventListener("click", () => {
    if (next === null) { $("#tres").textContent = "আগে “আগের ৩টা connection দেখো” চাপো।"; return; }
    const g = Number($("#guess").value);
    $("#tres").innerHTML = g === next
      ? "<span class='bad'>🎯 মিলে গেছে! Server ভাবছে তুমিই victim — session hijacked.</span>"
      : "<span class='good'>✖ ভুল (আসল ছিল " + next + ")। Server connection drop করল।</span>" + ($("#isn").value === "rnd" ? "\nRandom ISN-এ ২³² সম্ভাবনা — আন্দাজ প্রায় অসম্ভব।" : "\nCounter-এ তো শুধু +1! আবার চেষ্টা করো।");
    if ($("#isn").value === "rnd") next = rnd();
  });

  /* ---- smurf amplification ---- */
  function amp() {
    const h = +$("#ah").value, r = +$("#ar").value, bytes = 64;
    const inKbps = r * bytes * 8 / 1000, outKbps = inKbps * h;
    $("#aout").innerHTML = "Attacker পাঠাচ্ছে: " + r + " ping/s ≈ " + inKbps.toFixed(0) + " kbps\n" +
      "Victim পাচ্ছে:     " + (r * h).toLocaleString() + " reply/s ≈ <span class='bad'>" + (outKbps / 1000).toFixed(1) + " Mbps</span>\n" +
      "Amplification factor = " + h + "×  (LAN-এ যত host, তত গুণ)";
  }
  $("#ah").addEventListener("input", amp); $("#ar").addEventListener("input", amp); amp();

  /* ---- SYN flood ---- */
  const CAP = 16;
  let q = [], log = [];
  const secret = rnd().toString(16);
  const cookieOf = (ip, port) => parseInt(window.sha256(ip + ":" + port + "|10.0.0.1:80|" + Math.floor(Date.now() / 60000) + "|" + secret).slice(0, 8), 16);
  function paint() {
    const on = $("#cookie").checked;
    $("#qviz").innerHTML = on
      ? "SYN cookie চালু → backlog queue ব্যবহারই হচ্ছে না (state রাখা হয় না)\n[" + "·".repeat(CAP) + "]"
      : "Backlog (" + q.length + "/" + CAP + "): [" + q.map(x => x.bad ? "<span class='bad'>█</span>" : "<span class='good'>█</span>").join("") + "·".repeat(CAP - q.length) + "]" +
        (q.length >= CAP ? "\n<span class='bad'>Queue পূর্ণ! নতুন SYN drop হবে।</span>" : "");
    $("#slog").innerHTML = log.slice(-8).join("\n");
  }
  const fakeIP = () => [rnd() % 223 + 1, rnd() % 256, rnd() % 256, rnd() % 256].join(".");
  $("#flood").addEventListener("click", () => {
    const on = $("#cookie").checked;
    for (let i = 0; i < 20; i++) {
      const ip = fakeIP();
      if (on) { if (i < 2) log.push("SYN from " + ip + " → SYN-ACK seq=" + cookieOf(ip, 4000 + i) + " (cookie), কিছু মনে রাখা হলো না"); }
      else if (q.length < CAP) q.push({ ip, bad: true });
    }
    log.push(on ? "…২০টা ভুয়া SYN, server-এর memory খরচ ০। ACK কখনো আসবে না — কোনো ক্ষতি নেই।" : "😈 ২০টা SYN (spoofed src) এল; প্রতিটার জন্য half-open entry রাখা হলো, ACK আসবে না।");
    paint();
  });
  $("#legit").addEventListener("click", () => {
    const on = $("#cookie").checked, ip = "103.84.1.20", port = 51515;
    if (on) {
      const y = cookieOf(ip, port);
      log.push("🙂 SYN from " + ip + " → SYN-ACK seq=" + y + "\n🙂 ACK ack=" + (y + 1) + " → server আবার hash করে মেলাল: ✅ <span class='good'>connection established</span>");
    } else if (q.length < CAP) {
      q.push({ ip, bad: false });
      log.push("🙂 " + ip + " connect করল → <span class='good'>সফল</span> (handshake শেষে queue থেকে সরে যাবে)");
      setTimeout(() => { q = q.filter(x => x.bad || x.ip !== ip); paint(); }, 1200);
    } else log.push("🙂 " + ip + " connect করতে চাইল → <span class='bad'>DROPPED — denial of service!</span>");
    paint();
  });
  $("#sreset").addEventListener("click", () => { q = []; log = ["রিসেট।"]; paint(); });
  $("#cookie").addEventListener("change", () => { log.push("SYN cookie " + ($("#cookie").checked ? "চালু" : "বন্ধ")); paint(); });
  paint();
})();
