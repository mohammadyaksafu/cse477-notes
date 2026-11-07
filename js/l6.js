/* Lecture 6 labs */
(function () {
  const { $, $$, esc, mod, inv, caesar } = window.INS;
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /* ---- frequency analysis ---- */
  const EN = { E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.1, Z: 0.07 };
  function counts(t) { const c = {}; A.split("").forEach(l => c[l] = 0); t.toUpperCase().replace(/[^A-Z]/g, "").split("").forEach(l => c[l]++); return c; }
  function analyze() {
    const t = $("#fa-in").value, c = counts(t), total = Object.values(c).reduce((a, b) => a + b, 0) || 1;
    const max = Math.max(...Object.values(c), 1);
    $("#fa-chart").innerHTML = A.split("").map(l => {
      const h = Math.round(c[l] / max * 110);
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;font-size:10px;font-family:var(--mono)"><span>' + (c[l] || "") + '</span><div title="' + l + '" style="width:100%;height:' + h + 'px;background:var(--brand);border-radius:3px 3px 0 0"></div><span>' + l + "</span></div>";
    }).join("");
    const top = A.split("").sort((a, b) => c[b] - c[a]).slice(0, 5);
    $("#fa-out").innerHTML = "সবচেয়ে বেশি: " + top.map(l => l + " (" + (c[l] / total * 100).toFixed(1) + "%)").join(", ") +
      "\nইংরেজিতে সাধারণত: E 12.7%, T 9.1%, A 8.2%, O 7.5%, I 7.0%";
    return top[0];
  }
  $("#fa-go").addEventListener("click", analyze);
  $("#fa-guess").addEventListener("click", () => {
    const top = analyze(); const k = mod(top.charCodeAt(0) - 69, 26);
    $("#fa-out").innerHTML += "\n\nধরি " + top + " = E → shift k = " + k + "\nDecrypt: <b>" + esc(caesar($("#fa-in").value, -k)) + "</b>";
  });
  analyze();

  /* ---- Vigenère ---- */
  function vg() {
    const p = $("#vg-p").value.toUpperCase().replace(/[^A-Z]/g, ""), k = $("#vg-k").value.toUpperCase().replace(/[^A-Z]/g, "") || "A";
    let ks = "", c = "";
    for (let i = 0; i < p.length; i++) { const s = k.charCodeAt(i % k.length) - 65; ks += k[i % k.length]; c += A[(p.charCodeAt(i) - 65 + s) % 26]; }
    const shifts = k.split("").map(x => x.charCodeAt(0) - 65);
    $("#vg-out").innerHTML = "Key shifts (k1..km) = (" + shifts.join(", ") + "), m = " + k.length +
      "\nPlaintext : " + p.split("").join(" ") + "\nKey       : " + ks.split("").join(" ") + "\nCipher    : <b>" + c.split("").join(" ") + "</b>" +
      "\n\nলক্ষ করো: plaintext-এর একই অক্ষর (যেমন A) বিভিন্ন অবস্থানে ভিন্ন ciphertext অক্ষর হয়েছে।";
  }
  $("#vg-p").addEventListener("input", vg); $("#vg-k").addEventListener("input", vg); vg();

  /* ---- OTP reuse ---- */
  const hex = arr => arr.map(b => b.toString(16).padStart(2, "0")).join(" ");
  function otp() {
    const m1 = [...new TextEncoder().encode($("#otp1").value)], m2 = [...new TextEncoder().encode($("#otp2").value)];
    const n = Math.max(m1.length, m2.length);
    const key = Array.from(crypto.getRandomValues(new Uint8Array(n)));
    const c1 = m1.map((b, i) => b ^ key[i]), c2 = m2.map((b, i) => b ^ key[i]);
    const x = c1.map((b, i) => b ^ (c2[i] ?? 0));
    const m12 = m1.map((b, i) => b ^ (m2[i] ?? 0));
    $("#otp-out").innerHTML = "Key (র‍্যান্ডম) : " + hex(key) + "\nC1 = M1 ⊕ K    : " + hex(c1) + "\nC2 = M2 ⊕ K    : " + hex(c2) +
      "\n\nEve হিসাব করে C1 ⊕ C2 = " + hex(x) + "\n            M1 ⊕ M2 = " + hex(m12) +
      "\n<span class='bad'>দুটো হুবহু এক! key বাদ পড়ে গেছে।</span> এখন Eve যদি M1-এর একটা অংশ (যেমন \"AT\") অনুমান করে, সাথে সাথে M2-এর ঐ অংশ বেরিয়ে আসে।";
  }
  $("#otp-go").addEventListener("click", otp); otp();

  /* ---- Hill 2x2 ---- */
  function hill() {
    const k = $("#hk").value.trim().split(/[\s,]+/).map(Number);
    let p = $("#hp").value.toUpperCase().replace(/[^A-Z]/g, "");
    if (k.length !== 4 || k.some(isNaN)) { $("#hout").textContent = "৪টা সংখ্যা দাও: a b c d"; return; }
    if (p.length % 2) p += "X";
    const [a, b, c, d] = k, det = mod(a * d - b * c, 26), di = inv(det, 26);
    let out = "K = [" + a + " " + b + "; " + c + " " + d + "],  det = " + det + " (mod 26)\n";
    if (di === null) { $("#hout").innerHTML = out + "<span class='bad'>det-এর mod 26-এ inverse নেই → K invertible নয়, এই key চলবে না!</span>"; return; }
    const Ki = [mod(d * di, 26), mod(-b * di, 26), mod(-c * di, 26), mod(a * di, 26)];
    let cipher = "", steps = "";
    for (let i = 0; i < p.length; i += 2) {
      const x1 = p.charCodeAt(i) - 65, x2 = p.charCodeAt(i + 1) - 65;
      const y1 = mod(a * x1 + b * x2, 26), y2 = mod(c * x1 + d * x2, 26);
      cipher += A[y1] + A[y2];
      steps += p[i] + p[i + 1] + " = [" + x1 + "," + x2 + "] → [" + a + "·" + x1 + "+" + b + "·" + x2 + ", " + c + "·" + x1 + "+" + d + "·" + x2 + "] mod 26 = [" + y1 + "," + y2 + "] = " + A[y1] + A[y2] + "\n";
    }
    let back = "";
    for (let i = 0; i < cipher.length; i += 2) {
      const y1 = cipher.charCodeAt(i) - 65, y2 = cipher.charCodeAt(i + 1) - 65;
      back += A[mod(Ki[0] * y1 + Ki[1] * y2, 26)] + A[mod(Ki[2] * y1 + Ki[3] * y2, 26)];
    }
    $("#hout").innerHTML = out + steps + "\nCiphertext = <b>" + cipher + "</b>\nK⁻¹ (mod 26) = [" + Ki.slice(0, 2).join(" ") + "; " + Ki.slice(2).join(" ") + "]\nK⁻¹·c → <span class='good'>" + back + "</span> ✅";
  }
  $("#hk").addEventListener("input", hill); $("#hp").addEventListener("input", hill); hill();

  /* ---- PKCS5 padding ---- */
  function pad() {
    const t = $("#pd-in").value, b = +$("#pd-b").value;
    const bytes = [...new TextEncoder().encode(t)];
    const n = b - (bytes.length % b);
    const padded = bytes.concat(Array(n).fill(n));
    let s = "দৈর্ঘ্য = " + bytes.length + " byte → padding = " + b + " − (" + bytes.length + " mod " + b + ") = <b>" + n + "</b> টা byte, প্রতিটার মান " + n + "\n\n";
    for (let i = 0; i < padded.length; i += b) {
      s += "Block " + (i / b + 1) + ": " + padded.slice(i, i + b).map((x, j) => i + j >= bytes.length ? "<span class='hl'>" + String(x).padStart(2, "0") + "</span>" : (x >= 32 && x < 127 ? " " + String.fromCharCode(x) : "··")).join(" ") + "\n";
    }
    if (bytes.length % b === 0) s += "\nপুরো একটা padding block যোগ হয়েছে — যাতে receiver দ্ব্যর্থহীনভাবে padding সরাতে পারে।";
    $("#pd-out").innerHTML = s;
  }
  $("#pd-in").addEventListener("input", pad); $("#pd-b").addEventListener("change", pad); pad();

  /* ---- ECB vs CBC image ---- */
  const W = 40, H = 25, cell = 8;
  const src = document.createElement("canvas"); src.width = W; src.height = H;
  const sc = src.getContext("2d");
  sc.fillStyle = "#000"; sc.fillRect(0, 0, W, H);
  sc.fillStyle = "#f00"; sc.fillRect(0, 0, W, 3); sc.fillRect(0, H - 3, W, 3);
  sc.fillStyle = "#0f0"; sc.font = "bold 15px sans-serif"; sc.textBaseline = "middle"; sc.fillText("SUST", 1, 13);
  const d = sc.getImageData(0, 0, W, H).data;
  const pix = []; // palette index 0 bg,1 text,2 border
  for (let i = 0; i < W * H; i++) { const r = d[i * 4], g = d[i * 4 + 1]; pix.push(g > 110 ? 1 : r > 110 ? 2 : 0); }
  const palette = ["#1d3557", "#f4a261", "#e63946"];
  const KEY = 0x5eed1234;
  const E = x => { x = (x ^ KEY) >>> 0; x = Math.imul(x ^ (x >>> 16), 0x7feb352d); x = Math.imul(x ^ (x >>> 15), 0x846ca68b); return (x ^ (x >>> 16)) >>> 0; };
  const cv = $("#ecb"), ctx = cv.getContext("2d");
  function draw(mode) {
    let prev = 0x9e3779b9; // IV
    for (let y = 0; y < H; y++) for (let bx = 0; bx < W / 4; bx++) {
      const vals = [0, 1, 2, 3].map(j => pix[y * W + bx * 4 + j]);
      let colors;
      if (mode === "plain") colors = vals.map(v => palette[v]);
      else {
        const P = ((vals[0] << 24) | (vals[1] << 16) | (vals[2] << 8) | vals[3]) >>> 0;
        const C = mode === "ecb" ? E(P) : E((P ^ prev) >>> 0);
        prev = C;
        colors = [24, 16, 8, 0].map(s => "hsl(" + (((C >>> s) & 255) * 1.41 | 0) + ",65%,55%)");
      }
      colors.forEach((c, j) => { ctx.fillStyle = c; ctx.fillRect((bx * 4 + j) * cell, y * cell, cell, cell); });
    }
    $("#ecb-note").textContent = mode === "plain" ? "মূল ছবি" : mode === "ecb" ? "ECB: একই plaintext block → একই ciphertext block → লেখা পড়া যাচ্ছে! 😱" : "CBC: chaining-এর কারণে সব এলোমেলো ✅";
  }
  $$("[data-mode]").forEach(b => b.addEventListener("click", () => draw(b.dataset.mode)));
  draw("ecb");
})();
