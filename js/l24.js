/* Lecture 24: certificate chain check + look-alike domain detector */
(function () {
  const { $, esc } = window.INS;
  function check() {
    const site = $("#cdom").value.trim().toLowerCase(), cn = $("#ccn").value.trim().toLowerCase();
    const L = [], ok = s => L.push("✅ " + s), bad = s => L.push("<span class='bad'>❌ " + s + "</span>");
    let fine = true;
    if ($("#croot").checked) { bad("Root CA browser-এর trust store-এ নেই — chain কোনো anchor-এ পৌঁছায় না"); fine = false; }
    else ok("Root CA (self-signed) trust store-এ আছে — anchor পাওয়া গেল");
    if ($("#csig").checked) { bad("Root-এর public key দিয়ে intermediate-এর সই মেলে না"); fine = false; }
    else ok("Intermediate CA-র সই root দিয়ে যাচাই হলো");
    ok("Server certificate-এর সই intermediate দিয়ে যাচাই হলো");
    if ($("#cexp").checked) { bad("Validity period শেষ — expired"); fine = false; } else ok("মেয়াদ ঠিক আছে");
    L.push("   CRL download → CRL-এর সই যাচাই → serial number খোঁজা…");
    if ($("#crev").checked) { bad("Serial number CRL-এ আছে — revoked (key ফাঁস/প্রতিষ্ঠান বদল)"); fine = false; } else ok("Serial number CRL-এ নেই");
    if (site !== cn) { bad("Domain মেলে না: যাচ্ছ " + esc(site) + ", certificate " + esc(cn) + "-এর"); fine = false; } else ok("Domain মিলেছে: " + esc(cn));
    L.push("\n" + (fine ? "<span class='good'>🔒 Padlock দেখাও — সংযোগ নিরাপদ।</span>" : "<span class='bad'>⚠️ “Your connection is not private” — সতর্কবার্তা দেখাও!</span>"));
    $("#cout").innerHTML = L.join("\n");
  }
  $("#cgo").addEventListener("click", check); check();

  const KNOWN = ["ontest.com", "paypal.com", "google.com", "microsoft.com", "facebook.com", "bkash.com", "amazon.com", "sust.edu"];
  const SWAP = { "0": "o", "1": "l", "3": "e", "5": "s", "rn": "m", "vv": "w", "і": "i", "а": "a", "е": "e", "о": "o", "р": "p", "с": "c" };
  function norm(d) { let s = d.toLowerCase(); for (const [k, v] of Object.entries(SWAP)) s = s.split(k).join(v); return s; }
  function lev(a, b) { const m = []; for (let i = 0; i <= a.length; i++) { m[i] = [i]; for (let j = 1; j <= b.length; j++) m[i][j] = i ? Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j; } return m[a.length][b.length]; }
  function detect() {
    const d = $("#la").value.trim().toLowerCase();
    if (!d) { $("#laout").textContent = ""; return; }
    if (KNOWN.includes(d)) { $("#laout").innerHTML = "<span class='good'>✅ " + esc(d) + " — পরিচিত আসল domain।</span>"; return; }
    const n = norm(d), hit = KNOWN.find(k => k === n) || KNOWN.find(k => lev(d, k) <= 1);
    const nonAscii = /[^\x00-\x7f]/.test(d);
    $("#laout").innerHTML = hit
      ? "<span class='bad'>⚠️ " + esc(d) + " দেখতে " + hit + "-এর মতো, কিন্তু আলাদা domain!</span>\n" + (nonAscii ? "ভেতরে non-ASCII (যেমন Cyrillic) অক্ষর আছে।\n" : "") + "এর জন্যও বৈধ certificate কেনা সম্ভব → browser 🔒 দেখাবে। (semantic attack)"
      : "পরিচিত কোনো সাইটের সাথে স্পষ্ট মিল পাওয়া যায়নি" + (nonAscii ? ", তবে non-ASCII অক্ষর আছে — সাবধান।" : "।");
  }
  $("#la").addEventListener("input", detect); detect();
})();
