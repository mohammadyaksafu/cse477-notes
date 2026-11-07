/* Lecture 5 labs */
(function () {
  const { $, esc } = window.INS;
  const bitsDiff = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } } return d; };
  function hs() {
    const a = sha256($("#h1").value), b = sha256($("#h2").value);
    const mark = (x, y) => x.split("").map((c, i) => c === y[i] ? c : "<span class='hl'>" + c + "</span>").join("");
    const d = bitsDiff(a, b);
    $("#hout").innerHTML = "H(বার্তা ১) = " + mark(a, b) + "\nH(বার্তা ২) = " + mark(b, a) +
      "\n\n256 bit-এর মধ্যে বদলেছে <b>" + d + "</b> bit (" + (d / 2.56).toFixed(1) + "%)" + (a === b ? "  — হুবহু এক বার্তা!" : "");
  }
  $("#h1").addEventListener("input", hs); $("#h2").addEventListener("input", hs); hs();

  function mac() {
    const K = $("#mk").value, M = $("#mm").value, Mp = $("#mt").value;
    const A = sha256(K + "||" + M), Ap = sha256(K + "||" + Mp);
    const ok = A === Ap;
    $("#mout").innerHTML = "Alice: A = h(K‖M) = " + A.slice(0, 32) + "…\nপাঠাল (M, A)\n\n" +
      "Bob পেল M′ = \"" + esc(Mp) + "\"\nBob হিসাব করল A′ = h(K‖M′) = " + Ap.slice(0, 32) + "…\n\n" +
      (ok ? "<span class='good'>A = A′ ✅ বার্তা অক্ষত ও Alice-এর পাঠানো</span>" :
        "<span class='bad'>A ≠ A′ ❌ বার্তা বদলানো হয়েছে! Mallory K জানে না, তাই নতুন সঠিক MAC বানাতে পারেনি।</span>");
  }
  ["#mk", "#mm", "#mt"].forEach(s => $(s).addEventListener("input", mac)); mac();

  function human(sec) {
    if (sec < 1) return "১ সেকেন্ডেরও কম ⚡";
    const u = [["বছর", 31536000], ["দিন", 86400], ["ঘণ্টা", 3600], ["মিনিট", 60], ["সেকেন্ড", 1]];
    for (const [n, s] of u) if (sec >= s) { const v = sec / s; return (v > 1e6 ? v.toExponential(2) : v.toFixed(1)) + " " + n; }
  }
  function pw() {
    const p = $("#pw").value, g = +$("#gps").value;
    let set = 0; const groups = [];
    if (/[a-z]/.test(p)) { set += 26; groups.push("lower(26)"); }
    if (/[A-Z]/.test(p)) { set += 26; groups.push("UPPER(26)"); }
    if (/[0-9]/.test(p)) { set += 10; groups.push("digit(10)"); }
    if (/[^a-zA-Z0-9]/.test(p)) { set += 32; groups.push("special(32)"); }
    const L = [...p].length, space = Math.pow(set || 1, L);
    const common = /^(password|p@\$\$w0rd|passw0rd|123456|qwerty|seattle1|admin|letmein)$/i.test(p) || /^[A-Za-z]+[0-9]{1,4}$/.test(p);
    const strength = groups.length >= 3 && L >= 10 && !common ? "<span class='good'>শক্তিশালী 💪</span>" : groups.length >= 3 && L >= 8 && !common ? "মাঝারি" : "<span class='bad'>দুর্বল</span>";
    $("#pwout").innerHTML = "দৈর্ঘ্য = " + L + ", গ্রুপ: " + (groups.join(" + ") || "—") + " → set size = " + set +
      "\nSearch space = " + set + "^" + L + " ≈ <b>" + space.toExponential(2) + "</b>" +
      "\nBrute force-এ (গড়ে অর্ধেক খুঁজলে) সময়: <span class='hl'>" + human(space / 2 / g) + "</span>" +
      (common ? "\n<span class='bad'>⚠ কিন্তু এটা পরিচিত প্যাটার্ন (শব্দ + সংখ্যা / বিখ্যাত password) — dictionary attack সেকেন্ডেই ভাঙবে!</span>" : "") +
      "\nরায়: " + strength;
  }
  $("#pw").addEventListener("input", pw); $("#gps").addEventListener("change", pw); pw();
})();
