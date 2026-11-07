/* Lecture 9 labs */
(function () {
  const { $, modPow, inv, isPrime, gcd } = window.INS;
  const on = (ids, fn) => { ids.forEach(i => $(i).addEventListener("input", fn)); fn(); };
  const int = s => Math.floor(+$(s).value);

  on(["#gg", "#gp"], () => {
    const g = int("#gg"), p = int("#gp");
    if (!isPrime(p) || p > 2000) { $("#gout").innerHTML = "<span class='bad'>p একটা prime দাও (≤ 2000)</span>"; return; }
    const seen = [], set = new Set();
    for (let k = 0; k < p - 1; k++) { const v = Number(modPow(g, k, p)); seen.push(g + "^" + k + "=" + v); set.add(v); }
    const ok = set.size === p - 1;
    let phi = 0; for (let i = 1; i < p - 1; i++) if (gcd(i, p - 1) === 1) phi++;
    $("#gout").innerHTML = seen.slice(0, 24).join(", ") + (seen.length > 24 ? ", …" : "") + "\n\nপাওয়া গেল " + set.size + "টা ভিন্ন মান (দরকার " + (p - 1) + ")\n" +
      (ok ? "<span class='good'>" + g + " হলো Z" + p + "-এর generator ✅</span>" : "<span class='bad'>" + g + " generator নয় ❌ — চক্র তাড়াতাড়ি ফিরে আসে</span>") +
      "\nZ" + p + "-এ মোট generator = Φ(p−1) = Φ(" + (p - 1) + ") = " + phi;
  });

  function elg(newK) {
    const p = int("#ep"), g = int("#eg"), x = int("#ex"), M = int("#em");
    if (!isPrime(p)) { $("#eout").innerHTML = "<span class='bad'>p prime হতে হবে</span>"; return; }
    if (!(M > 0 && M < p)) { $("#eout").innerHTML = "<span class='bad'>0 < M < p হতে হবে</span>"; return; }
    const y = modPow(g, x, p);
    const k = newK ? 1 + Math.floor(Math.random() * (p - 2)) : 3;
    const a = modPow(g, k, p), b = BigInt(M) * modPow(y, k, p) % BigInt(p);
    const ax = modPow(a, x, p), axi = inv(Number(ax), p);
    const dec = b * BigInt(axi) % BigInt(p);
    $("#eout").innerHTML = "Bob: y = g^x mod p = " + g + "^" + x + " mod " + p + " = " + y + "   Public (p,g,y) = (" + p + "," + g + "," + y + ")\n\n" +
      "Alice র‍্যান্ডম k = <span class='hl'>" + k + "</span>\n a = g^k mod p = " + a + "\n b = M·y^k mod p = " + M + "·" + modPow(y, k, p) + " mod " + p + " = " + b + "\n Ciphertext = <b>(" + a + ", " + b + ")</b>\n\n" +
      "Bob: a^x = " + ax + ", (a^x)⁻¹ = " + axi + "\n M = b·(a^x)⁻¹ mod p = <b>" + dec + "</b> " + (Number(dec) === M ? "<span class='good'>✅</span>" : "") +
      "\nShared one-time key g^(xk) = " + modPow(g, x * k, p);
  }
  ["#ep", "#eg", "#ex", "#em"].forEach(s => $(s).addEventListener("input", () => elg(false)));
  $("#eenc").addEventListener("click", () => elg(true)); elg(false);

  function dh() {
    const p = int("#dp"), g = int("#dg"), x = int("#dx"), y = int("#dy"), mal = $("#dm").checked, s = int("#ds"), t = int("#dt");
    if (!isPrime(p)) { $("#dout").innerHTML = "<span class='bad'>p prime হতে হবে</span>"; return; }
    const X = modPow(g, x, p), Y = modPow(g, y, p);
    let o = "পাবলিক: p = " + p + ", g = " + g + "\nAlice: x = " + x + " → X = " + g + "^" + x + " mod " + p + " = " + X + "\nBob  : y = " + y + " → Y = " + g + "^" + y + " mod " + p + " = " + Y + "\n\n";
    if (!mal) {
      const K1 = modPow(Y, x, p), K2 = modPow(X, y, p);
      o += "Alice: K1 = Y^x = " + Y + "^" + x + " mod " + p + " = <b>" + K1 + "</b>\nBob  : K2 = X^y = " + X + "^" + y + " mod " + p + " = <b>" + K2 + "</b>\n" +
        (K1 === K2 ? "<span class='good'>K1 = K2 = " + K1 + " — shared secret! ✅</span>" : "") + "\nEve দেখেছে শুধু X = " + X + ", Y = " + Y + " — K পেতে discrete log লাগবে।";
    } else {
      const S = modPow(g, s, p), T = modPow(g, t, p);
      const K1 = modPow(S, x, p), K2 = modPow(T, y, p);
      o += "😈 Mallory X আটকে Bob-কে পাঠায় T = g^t = " + T + ", আর Y আটকে Alice-কে পাঠায় S = g^s = " + S + "\n\n" +
        "Alice ভাবে Bob-এর সাথে key: S^x = <b>" + K1 + "</b>   (Mallory-ও জানে: X^s = " + modPow(X, s, p) + ")\n" +
        "Bob ভাবে Alice-এর সাথে key: T^y = <b>" + K2 + "</b>   (Mallory-ও জানে: Y^t = " + modPow(Y, t, p) + ")\n\n" +
        "<span class='bad'>Alice → [K1-এ encrypt] → Mallory decrypt করে পড়ে → [K2-এ encrypt] → Bob। কেউ টের পায় না!</span>";
    }
    $("#dout").innerHTML = o;
  }
  ["#dp", "#dg", "#dx", "#dy", "#ds", "#dt"].forEach(s => $(s).addEventListener("input", dh));
  $("#dm").addEventListener("change", dh); dh();

  // toy Merkle-Damgard
  const C = (blockStr, prev) => { // toy compression: 32-bit mixing
    let h = prev >>> 0;
    for (const ch of blockStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; h ^= h >>> 13; }
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0; return (h ^ (h >>> 13)) >>> 0;
  };
  on(["#md-in"], () => {
    let m = $("#md-in").value;
    const len = m.length; m += "#"; while (m.length % 4) m += "0"; // unambiguous-ish padding
    const hx = v => v.toString(16).padStart(8, "0");
    let d = 0x6a09e667, s = "IV v = " + hx(d) + "\n";
    for (let i = 0; i < m.length; i += 4) {
      const b = m.slice(i, i + 4); const nd = C(b, d);
      s += "d" + (i / 4 + 1) + " = C(\"" + b + "\", " + hx(d) + ") = " + hx(nd) + "\n"; d = nd;
    }
    $("#md-out").innerHTML = s + "\n(দৈর্ঘ্য " + len + ", '#' + 0 দিয়ে pad)\nH = <b>" + hx(d) + "</b>";
  });

  // birthday
  const pB = n => { let q = 1; for (let i = 0; i < n; i++) q *= (365 - i) / 365; return 1 - q; };
  const svg = $("#bchart");
  function chart(n) {
    const W = 400, H = 160, L = 30, B = 20;
    let pts = ""; for (let k = 1; k <= 80; k++) pts += (L + (k - 1) / 79 * (W - L - 10)).toFixed(1) + "," + (H - B - pB(k) * (H - B - 10)).toFixed(1) + " ";
    const cx = L + (n - 1) / 79 * (W - L - 10), cy = H - B - pB(n) * (H - B - 10);
    svg.innerHTML =
      '<line x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - 10) + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".3"/>' +
      '<line x1="' + L + '" y1="' + (H - B - 0.5 * (H - B - 10)) + '" x2="' + (W - 10) + '" y2="' + (H - B - 0.5 * (H - B - 10)) + '" stroke="currentColor" opacity=".25" stroke-dasharray="4 4"/>' +
      '<text x="2" y="' + (H - B - 0.5 * (H - B - 10) + 4) + '" font-size="10" fill="currentColor" opacity=".7">50%</text>' +
      '<text x="2" y="14" font-size="10" fill="currentColor" opacity=".7">100%</text>' +
      '<text x="' + L + '" y="' + (H - 4) + '" font-size="10" fill="currentColor" opacity=".7">1</text><text x="' + (W - 24) + '" y="' + (H - 4) + '" font-size="10" fill="currentColor" opacity=".7">80 জন</text>' +
      '<polyline points="' + pts + '" fill="none" style="stroke:var(--brand)" stroke-width="2.5"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" style="fill:var(--accent)"/>';
  }
  on(["#bn"], () => {
    const n = int("#bn"); $("#bnv").textContent = n;
    const p = pB(n);
    $("#bout").innerHTML = "P(A′) = " + Array.from({ length: Math.min(n, 4) }, (_, i) => (365 - i) + "/365").join(" × ") + (n > 4 ? " × … × " + (365 - n + 1) + "/365" : "") + " = " + (1 - p).toFixed(6) +
      "\nP(A) = 1 − P(A′) = <b>" + (p * 100).toFixed(2) + "%</b>" + (p > 0.5 ? "  > 50% 🎉" : "");
    chart(n);
  });
  $("#bsim").addEventListener("click", () => {
    let hit = 0;
    for (let t = 0; t < 1000; t++) { const s = new Set(); let c = false; for (let i = 0; i < 23; i++) { const b = Math.floor(Math.random() * 365); if (s.has(b)) { c = true; break; } s.add(b); } if (c) hit++; }
    $("#bsout").innerHTML = "১০০০টা ক্লাসের মধ্যে <b>" + hit + "</b>টায় অন্তত দুজনের জন্মদিন এক (" + (hit / 10).toFixed(1) + "%)। তত্ত্ব বলে 50.7%।";
  });

  // RSA signature mutability
  on(["#sm1", "#sm2"], () => {
    const n = 119, e = 5, d = 77, M1 = int("#sm1"), M2 = int("#sm2");
    if (!(M1 > 0 && M1 < n && M2 > 0 && M2 < n)) { $("#sout").textContent = "0 < M < 119 দাও"; return; }
    const S1 = modPow(M1, d, n), S2 = modPow(M2, d, n), S = S1 * S2 % 119n, M = (M1 * M2) % n;
    $("#sout").innerHTML = "Bob-এর বৈধ সই: S1 = " + M1 + "^77 mod 119 = " + S1 + ",   S2 = " + M2 + "^77 mod 119 = " + S2 + "\n\n" +
      "Eve (d না জেনে) বানায়: S = S1·S2 mod 119 = <b>" + S + "</b>\nVerify: S^e mod n = " + S + "^5 mod 119 = " + modPow(S, e, n) + "\nবার্তা M1·M2 mod n = " + M + "\n" +
      (Number(modPow(S, e, n)) === M ? "<span class='bad'>✔ বৈধ! Bob কখনো " + M + "-এ সই করেনি, তবুও সই যাচাই পাস করল 😱 — nonmutability নেই</span>" : "");
  });
})();
