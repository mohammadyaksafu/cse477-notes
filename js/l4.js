/* Lecture 4 labs */
(function () {
  const { $, esc, mod } = window.INS;
  const shift = (txt, k) => txt.replace(/[a-z]/gi, ch => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(mod(ch.charCodeAt(0) - base + k, 26) + base);
  });
  window.INS.caesar = shift;

  // Caesar machine
  function cz() {
    const k = +$("#cz-k").value; $("#cz-kv").textContent = k;
    const t = $("#cz-in").value.toUpperCase();
    const row1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", row2 = shift(row1, k);
    $("#cz-out").innerHTML = "Plain : " + row1.split("").join(" ") + "\nCipher: " + row2.split("").join(" ") +
      "\n\ns(M, " + k + ") = <b>" + esc(shift(t, k)) + "</b>\n" + (k > 0 ? "(k > 0 → forward shift = encryption)" : k < 0 ? "(k < 0 → backward shift = decryption)" : "(k = 0 → কিছুই বদলায় না)");
  }
  $("#cz-in").addEventListener("input", cz); $("#cz-k").addEventListener("input", cz); cz();

  // Key count
  function kc() {
    const n = +$("#kn").value; $("#knv").textContent = n;
    const sym = n * (n - 1) / 2;
    const w = 40, s = Math.max(1, Math.round(w * Math.min(1, n / sym))) ;
    $("#kout").innerHTML = "Symmetric : n(n−1)/2 = <b>" + sym.toLocaleString() + "</b> টা গোপন key\n" +
      "Public key: n = <b>" + n.toLocaleString() + "</b> টা key pair (প্রত্যেকে ১টা public key প্রকাশ করে)\n\n" +
      "Public  " + "█".repeat(s) + "\nSymmetric " + "█".repeat(w) + "\n(অনুপাত ≈ " + ((n - 1) / 2).toFixed(1) + " গুণ বেশি key symmetric-এ)";
  }
  $("#kn").addEventListener("input", kc); kc();

  // Brute force with English letter-frequency score
  const freq = { E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.1, Z: 0.07 };
  const score = t => t.toUpperCase().split("").reduce((s, c) => s + (freq[c] || 0), 0) / Math.max(1, t.replace(/[^A-Z]/gi, "").length);
  $("#bf-go").addEventListener("click", () => {
    const c = $("#bf-in").value.toUpperCase();
    const res = [];
    for (let k = 0; k < 26; k++) { const p = shift(c, -k); res.push({ k, p, s: score(p) }); }
    const best = res.reduce((a, b) => (b.s > a.s ? b : a));
    $("#bf-out").innerHTML = res.map(r => {
      const line = "key " + String(r.k).padStart(2) + " → " + esc(r.p) + "   (score " + r.s.toFixed(2) + ")";
      return r === best ? "<span class='hl'>" + line + "  ← অর্থবহ!</span>" : line;
    }).join("\n");
  });

  // unicity
  function un() {
    const k = +$("#uk").value || 0, a = Math.min(0.99, Math.max(0.01, +$("#ua").value || 0.16));
    const n = k / (1 - a);
    $("#uout").innerHTML = "n = k / (1 − α) = " + k + " / " + (1 - a).toFixed(2) + " = <b>" + n.toFixed(1) + " bit</b> ≈ <span class='hl'>" + Math.ceil(n / 8) + " টা ASCII অক্ষর</span>\n" +
      "এর চেয়ে লম্বা ciphertext হলে brute-force-এ পাওয়া অর্থবহ plaintext প্রায় নিশ্চিতভাবে সঠিকটাই।";
  }
  $("#uk").addEventListener("input", un); $("#ua").addEventListener("input", un); un();
})();
