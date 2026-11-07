/* Lecture 7 labs */
(function () {
  const { $, esc } = window.INS;
  const h2 = b => b.toString(16).padStart(2, "0");
  // render a column-major 16-byte state as a 4x4 grid
  function grid(bytes, fmt, rowColor) {
    let s = '<div class="grid4">';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += '<span class="' + (rowColor ? "r" + r : "") + '">' + fmt(bytes[r + 4 * c], r + 4 * c) + "</span>";
    return s + "</div>";
  }
  const labelled = (title, html) => '<div style="display:inline-block;vertical-align:top;margin-right:10px"><div class="flash-hint">' + title + "</div>" + html + "</div>";

  // state fill
  function st() {
    const t = ($("#st-in").value + "················").slice(0, 16).split("");
    $("#st-grid").innerHTML = labelled("ইনপুট ক্রম", '<div class="out" style="display:inline-block">' + t.map((c, i) => i + ":" + esc(c)).join("  ") + "</div>") + "<br>" +
      labelled("State (column-major)", grid(t, (c, i) => esc(c) + '<sub style="font-size:.6em;opacity:.6">' + i + "</sub>")) +
      labelled("Hex", grid(t.map(c => c.charCodeAt(0) & 255), b => h2(b)));
  }
  $("#st-in").addEventListener("input", st); st();

  // sbox lookup
  function sb() {
    const v = parseInt($("#sb-in").value, 16);
    if (isNaN(v) || v > 255) { $("#sb-out").textContent = "00–ff দাও"; return; }
    $("#sb-out").innerHTML = "0x" + h2(v) + " → সারি " + (v >> 4).toString(16) + ", কলাম " + (v & 15).toString(16) + " → <b>0x" + h2(AES.SBOX[v]) + "</b>  (inverse S-box ফিরিয়ে দেয় 0x" + h2(AES.INV[AES.SBOX[v]]) + ")";
  }
  $("#sb-in").addEventListener("input", sb); sb();

  // shift rows animation
  let srState = Array.from({ length: 16 }, (_, i) => i);
  const srNames = ["a", "b", "c", "d"];
  const drawSR = () => { $("#sr-grid").innerHTML = grid(srState, (v) => srNames[v % 4] + Math.floor(v / 4), true); };
  $("#sr-go").addEventListener("click", () => { srState = AES.shiftRows(srState); drawSR(); });
  $("#sr-inv").addEventListener("click", () => { srState = AES.invShiftRows(srState); drawSR(); });
  drawSR();

  // mix one column
  function mc() {
    const a = $("#mc-in").value.trim().split(/\s+/).map(x => parseInt(x, 16));
    if (a.length !== 4 || a.some(x => isNaN(x) || x > 255)) { $("#mc-out").textContent = "৪টা hex byte দাও, যেমন: db 13 53 45"; return; }
    const o = AES.mixCol(a);
    const g = AES.gmul;
    $("#mc-out").innerHTML = "b0 = 02·" + h2(a[0]) + " ⊕ 03·" + h2(a[1]) + " ⊕ " + h2(a[2]) + " ⊕ " + h2(a[3]) + " = " + h2(g(a[0], 2)) + " ⊕ " + h2(g(a[1], 3)) + " ⊕ " + h2(a[2]) + " ⊕ " + h2(a[3]) + " = <b>" + h2(o[0]) + "</b>\n" +
      "ফলাফল কলাম: <b>" + o.map(h2).join(" ") + "</b>";
  }
  $("#mc-in").addEventListener("input", mc); mc();

  // full AES explorer
  const parseHex = s => { s = s.replace(/\s+/g, ""); if (!/^[0-9a-fA-F]{32}$/.test(s)) return null; return s.match(/../g).map(x => parseInt(x, 16)); };
  let T = null;
  function run() {
    const p = parseHex($("#aes-p").value), k = parseHex($("#aes-k").value);
    if (!p || !k) { $("#aes-view").innerHTML = ""; $("#aes-final").textContent = "Plaintext ও key দুটোই ঠিক ৩২টা hex অক্ষর হতে হবে।"; T = null; return; }
    T = AES.encryptTrace(p, k);
    $("#aes-final").innerHTML = "Ciphertext = <b>" + T.ct.map(h2).join("") + "</b>";
    $("#aes-ks").textContent = T.w.map((w, i) => "w" + String(i).padEnd(2) + " = " + w.map(h2).join(" ") + (i % 4 === 3 ? "   ← round " + (i >> 2) + " key শেষ\n" : "\n")).join("");
    view();
  }
  function view() {
    if (!T) return;
    const r = +$("#aes-r").value; $("#aes-rv").textContent = r;
    const t = T.trace[r], f = b => h2(b);
    let html;
    if (r === 0) html = labelled("Input", grid(t.input, f)) + labelled("⊕ Round key 0 (w0–w3)", grid(t.key, f)) + labelled("= Output", grid(t.out, f));
    else html = labelled("শুরু", grid(t.start, f)) + labelled("SubBytes", grid(t.sub, f)) + labelled("ShiftRows", grid(t.shift, f, true)) +
      (t.mix ? labelled("MixColumns", grid(t.mix, f)) : labelled("MixColumns", '<div class="out">শেষ round —<br>বাদ</div>')) +
      labelled("⊕ Round key " + r, grid(t.key, f)) + labelled("= Output", grid(t.out, f));
    $("#aes-view").innerHTML = html;
  }
  ["#aes-p", "#aes-k"].forEach(s => $(s).addEventListener("input", run));
  $("#aes-r").addEventListener("input", view);
  $("#aes-text").addEventListener("click", () => {
    const hx = s => [...s].map(c => h2(c.charCodeAt(0))).join("");
    $("#aes-p").value = hx("Two One Nine Two"); $("#aes-k").value = hx("Thats my Kung Fu"); run();
    $("#aes-final").innerHTML += "\n(প্রত্যাশিত: 29c3505f571420f6402299b31a02d73a)";
  });
  run();
})();
