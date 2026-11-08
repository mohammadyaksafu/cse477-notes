/* Lecture 25: cookie domain rules, session-ID predictability, homograph inspector */
(function () {
  const { $, esc } = window.INS;
  const lv = d => d.split(".").length;
  const within = (h, d) => h === d || h.endsWith("." + d);
  function cookie() {
    const h = $("#ch").value, d = $("#cd").value;
    let read, set;
    if (!within(h, d) && !within(d, h)) { read = false; set = false; }
    else {
      read = within(h, d);                         // host can read cookies for itself and ancestor domains
      set = h === d || (within(h, d) && lv(h) - lv(d) === 1); // only itself or one level up
    }
    const y = b => b ? "<span class='good'>✅ পারে</span>" : "<span class='bad'>❌ পারে না</span>";
    let why;
    if (!within(h, d) && !within(d, h)) why = "সম্পূর্ণ আলাদা domain — কোনো সম্পর্ক নেই।";
    else if (h === d) why = "নিজের domain — পড়া ও সেট দুটোই চলে।";
    else if (within(h, d)) why = h + " হলো " + d + "-এর subdomain → উপরের দিকের cookie পড়তে পারে; সেট করতে পারে শুধু এক স্তর উপর পর্যন্ত (" + (lv(h) - lv(d)) + " স্তর উপরে)।";
    else why = h + " হলো " + d + "-এর parent → নিচের (subdomain-এর) cookie পড়তে বা সেট করতে পারে না।";
    $("#cout").innerHTML = "Host: " + h + "   Cookie domain: ." + d + "\nপড়া (read): " + y(read) + "\nসেট (set):   " + y(set) + "\n\n" + esc(why);
  }
  $("#ch").addEventListener("change", cookie); $("#cd").addEventListener("change", cookie); cookie();

  $("#sgo").addEventListener("click", () => {
    const g = $("#sg").value, ids = [];
    const t0 = Date.now();
    for (let i = 0; i < 5; i++) {
      if (g === "seq") ids.push(String(1001 + i));
      else if (g === "time") ids.push(String(t0 + i * 37));
      else ids.push(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""));
    }
    const verdict = g === "rnd"
      ? "<span class='good'>2¹²⁸ সম্ভাবনা — attacker আন্দাজ করতে পারবে না।</span>"
      : "<span class='bad'>Attacker নিজে login করে নিজের ID দেখে পাশের ID গুলো আন্দাজ করবে → অন্যের session hijack!</span>";
    $("#sout").innerHTML = ids.map((x, i) => "user" + (i + 1) + " → SESSIONID=" + x).join("\n") + "\n\n" + verdict;
  });

  function inspect(s) {
    const rows = [...s].map(ch => {
      const cp = ch.codePointAt(0), hex = "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
      const odd = cp > 127;
      return "  " + esc(ch) + "  " + (odd ? "<span class='bad'>" + hex + " ⚠️ non-ASCII" + (cp >= 0x400 && cp <= 0x4ff ? " (Cyrillic)" : "") + "</span>" : hex);
    });
    let puny = "";
    try { puny = new URL("http://" + s.trim()).hostname; } catch (e) { puny = "(বৈধ hostname নয়)"; }
    $("#hout").innerHTML = "“" + esc(s) + "”\n" + rows.join("\n") + "\n\nBrowser আসলে যে নামে যায় (punycode): " + esc(puny);
  }
  $("#h1").addEventListener("click", () => inspect("www.paypal.com"));
  $("#h2").addEventListener("click", () => inspect("www.раураl.com"));
  $("#hin").addEventListener("input", e => e.target.value && inspect(e.target.value));
})();
