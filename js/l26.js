/* Lecture 26: reflected-XSS viewer (never executes), file inclusion resolver, SQLi login simulator */
(function () {
  const { $, $$, esc } = window.INS;

  /* ---- XSS: show the HTML the server would send; we only ever display it as text ---- */
  function xss() {
    const q = $("#xq").value, san = $("#xsan").checked;
    const body = san ? esc(q).replace(/'/g, "&#39;") : q;
    const html = "<p>Search results for " + body + "</p>";
    const dangerous = !san && /<\s*script|on\w+\s*=|javascript:/i.test(q);
    $("#xout").innerHTML = "Server-এর পাঠানো HTML:\n" + esc(html) + "\n\n" + (dangerous
      ? "<span class='bad'>⚠️ Browser এটাকে কোড হিসেবে চালাবে — বিশ্বস্ত সাইটের নামে script, cookie চুরি সম্ভব!</span>"
      : san ? "<span class='good'>✅ &lt; &gt; encode হয়ে গেছে — browser শুধু লেখা হিসেবে দেখাবে, চালাবে না।</span>" : "সাধারণ লেখা — সমস্যা নেই।");
  }
  $("#xq").addEventListener("input", xss); $("#xsan").addEventListener("change", xss); xss();

  /* ---- file inclusion ---- */
  const FS = {
    "/var/www/news.php": "📰 আজকের খবর…",
    "/var/www/admin/secretpage.php": "🔑 ADMIN PANEL — সব user-এর তালিকা (authentication bypassed!)",
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin\nsust:x:1000:1000::/home/sust:/bin/bash"
  };
  function resolve(p) {
    const parts = ("/var/www/" + p).split("/"), out = [];
    parts.forEach(s => { if (s === "..") out.pop(); else if (s && s !== ".") out.push(s); });
    return "/" + out.join("/");
  }
  function fi() {
    let p = $("#fi").value;
    const ext = $("#fiext").checked, L = [];
    if (/^https?:\/\//i.test(p)) {
      L.push("include(\"" + esc(p) + (ext ? ".php" : "") + "\")");
      L.push("<span class='bad'>🌍 RFI: সার্ভার অন্য সার্ভার থেকে কোড এনে চালাচ্ছে → web shell! attacker এখন ফাইল দেখা/বদলানো/মোছা করতে পারে।</span>");
      L.push("(আধুনিক PHP-তে allow_url_include=Off থাকায় সাধারণত আটকে যায়।)");
    } else {
      let full = p + (ext ? ".php" : "");
      L.push("include(\"" + esc(full) + "\")");
      const nul = full.indexOf("%00");
      if (nul >= 0) { full = full.slice(0, nul); L.push("%00 = null byte → string এখানেই শেষ, পরের অংশ উপেক্ষা: \"" + esc(full) + "\""); }
      const path = resolve(full);
      L.push("আসল path: " + esc(path));
      L.push(FS[path] ? (path === "/var/www/news.php" ? "<span class='good'>" + esc(FS[path]) + "</span>" : "<span class='bad'>" + esc(FS[path]) + "</span>") : "Not found!");
    }
    $("#fiout").innerHTML = L.join("\n");
  }
  $("#fi").addEventListener("input", fi); $("#fiext").addEventListener("change", fi);
  $$("[data-fi]").forEach(b => b.addEventListener("click", () => { $("#fi").value = b.dataset.fi; if (b.dataset.fi.includes("passwd")) $("#fiext").checked = true; fi(); }));
  fi();

  /* ---- SQL injection: tiny evaluator for WHERE user='..' AND pwd='..' with OR support ---- */
  const USERS = [{ user: "alice", pwd: "s3cret" }, { user: "admin", pwd: "Adm!n#2026" }, { user: "bob", pwd: "hunter2" }];
  function tokens(where) { // split into literal comparisons joined by AND/OR, very small grammar
    const re = /(\w+)\s*=\s*'([^']*)'|'([^']*)'\s*=\s*'([^']*)'|\bAND\b|\bOR\b/gi, t = []; let m;
    while ((m = re.exec(where))) t.push(m[0].toUpperCase() === "AND" ? "AND" : m[0].toUpperCase() === "OR" ? "OR" : m[1] ? { col: m[1], val: m[2] } : { a: m[3], b: m[4] });
    return t;
  }
  function evalRow(t, row) { // AND binds tighter than OR
    let orAcc = false, andAcc = true;
    const term = x => x.col ? row[x.col] === x.val : x.a === x.b;
    t.forEach(x => { if (x === "OR") { orAcc = orAcc || andAcc; andAcc = true; } else if (x !== "AND") andAcc = andAcc && term(x); });
    return orAcc || andAcc;
  }
  function login() {
    const u = $("#su").value, p = $("#sp").value, safe = $("#sesc").checked;
    if (safe) {
      const q = "SELECT * FROM users WHERE user = ? AND pwd = ?   params: [" + JSON.stringify(u) + ", " + JSON.stringify(p) + "]";
      const hit = USERS.find(r => r.user === u && r.pwd === p);
      $("#sout").innerHTML = esc(q) + "\n\nInput পুরোটাই data হিসেবে তুলনা হলো — কোড হিসেবে নয়।\n" + (hit ? "<span class='good'>✅ Welcome, " + esc(hit.user) + "</span>" : "<span class='good'>❌ Login failed — injection কাজ করেনি 🛡️</span>");
      return;
    }
    const q = "select * from users where user='" + u + "' AND pwd='" + p + "'";
    const where = q.slice(q.indexOf("where") + 5), t = tokens(where);
    const rows = USERS.filter(r => evalRow(t, r));
    $("#sout").innerHTML = esc(q) + "\n\nফলাফল: " + rows.length + " row\n" + (rows.length
      ? (u.includes("'") ? "<span class='bad'>🔓 Password ছাড়াই login! প্রথম row হিসেবে ঢুকলে: " + esc(rows[0].user) + "</span>" : "<span class='good'>✅ Welcome, " + esc(rows[0].user) + "</span>")
      : "❌ Login failed");
  }
  $("#slogin").addEventListener("click", login);
  $("#snormal").addEventListener("click", () => { $("#su").value = "alice"; $("#sp").value = "s3cret"; login(); });
  $("#sesc").addEventListener("change", login);
  login();
})();
