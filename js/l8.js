/* Lecture 8 labs */
(function () {
  const { $, mod, modPow, gcd, egcd, inv, isPrime } = window.INS;
  const on = (ids, fn) => { ids.forEach(i => $(i).addEventListener("input", fn)); fn(); };

  on(["#fz"], () => {
    let n = Math.floor(+$("#fz").value);
    if (!(n >= 2) || n > 1e12) { $("#fzout").textContent = "2 থেকে 10¹² এর মধ্যে সংখ্যা দাও"; return; }
    const f = {}; let m = n;
    for (let p = 2; p * p <= m; p++) while (m % p === 0) { f[p] = (f[p] || 0) + 1; m /= p; }
    if (m > 1) f[m] = (f[m] || 0) + 1;
    const sup = e => String(e).replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
    $("#fzout").innerHTML = n + " = <b>" + Object.entries(f).map(([p, e]) => p + (e > 1 ? sup(e) : "")).join(" × ") + "</b>" + (isPrime(n) ? "   ← নিজেই prime!" : "");
  });

  on(["#ga", "#gb"], () => {
    let a = Math.abs(Math.floor(+$("#ga").value)), b = Math.abs(Math.floor(+$("#gb").value));
    const A = [a], Bv = [b];
    let steps = "";
    while (b !== 0 && A.length < 40) { steps += "gcd(" + a + ", " + b + ") = gcd(" + b + ", " + a + " mod " + b + " = " + (a % b) + ")\n"; [a, b] = [b, a % b]; A.push(a); Bv.push(b); }
    $("#gtab").innerHTML = "<tr><th>a</th>" + A.map(x => '<td class="c">' + x + "</td>").join("") + "</tr><tr><th>b</th>" + Bv.map(x => '<td class="c">' + x + "</td>").join("") + "</tr>";
    $("#gout").innerHTML = steps + "b = 0 → উত্তর <b>" + a + "</b>" + (a === 1 ? "  (relatively prime!)" : "");
  });

  on(["#zn"], () => {
    const n = Math.min(30, Math.max(2, Math.floor(+$("#zn").value) || 2));
    let r1 = "<tr><th>x</th>", r2 = "<tr><th>x⁻¹</th>";
    for (let x = 0; x < n; x++) { const i = inv(x, n); r1 += '<td class="c">' + x + "</td>"; r2 += '<td class="c">' + (i === null || x === 0 ? "" : i) + "</td>"; }
    $("#invtab").innerHTML = r1 + "</tr>" + r2 + "</tr>";
    const maxE = Math.min(n - 1, 12);
    let p = "<tr><th>x \\ k</th>" + Array.from({ length: maxE }, (_, k) => '<th class="c">x' + (k + 1 > 1 ? "<sup>" + (k + 1) + "</sup>" : "") + "</th>").join("") + "</tr>";
    for (let x = 1; x < n; x++) {
      p += "<tr><th>" + x + "</th>";
      for (let k = 1; k <= maxE; k++) { const v = Number(modPow(x, k, n)); p += '<td class="c"' + (v === 1 ? ' style="background:var(--good-soft);font-weight:700"' : "") + ">" + v + "</td>"; }
      p += "</tr>";
    }
    $("#powtab").innerHTML = p;
  });

  on(["#eu"], () => {
    const n = Math.min(200, Math.max(2, Math.floor(+$("#eu").value) || 2));
    const Z = []; for (let x = 1; x < n; x++) if (gcd(x, n) === 1) Z.push(x);
    const phi = Z.length;
    $("#euout").innerHTML = "Z" + n + "* = {" + Z.join(", ") + "}\nΦ(" + n + ") = <b>" + phi + "</b>" + (isPrime(n) ? "  (prime, তাই n−1)" : "") + "\n\n" +
      Z.slice(0, 8).map(x => x + "^" + phi + " mod " + n + " = " + modPow(x, phi, n)).join("\n") + (Z.length > 8 ? "\n…" : "") + "\n<span class='good'>সবগুলো 1 ✅ — Euler-এর theorem</span>";
  });

  on(["#rp", "#rq", "#re", "#rm"], () => {
    const p = Math.floor(+$("#rp").value), q = Math.floor(+$("#rq").value), e = Math.floor(+$("#re").value), M = Math.floor(+$("#rm").value);
    const out = $("#rout");
    if (!isPrime(p) || !isPrime(q)) { out.innerHTML = "<span class='bad'>p ও q দুটোই prime হতে হবে</span>"; return; }
    if (p === q) { out.innerHTML = "<span class='bad'>p ≠ q হতে হবে</span>"; return; }
    const n = p * q, phi = (p - 1) * (q - 1);
    let s = "n = " + p + " × " + q + " = " + n + "\nΦ(n) = (" + (p - 1) + ")(" + (q - 1) + ") = " + phi + "\n";
    if (gcd(e, phi) !== 1) { out.innerHTML = s + "<span class='bad'>gcd(e, Φ(n)) = " + gcd(e, phi) + " ≠ 1 → অন্য e নাও</span>"; return; }
    const d = inv(e, phi);
    s += "gcd(" + e + ", " + phi + ") = 1 ✅\nd = e⁻¹ mod Φ(n) = <b>" + d + "</b>   (যাচাই: " + e + "×" + d + " = " + e * d + " = " + Math.floor(e * d / phi) + "×" + phi + " + 1)\n\n";
    s += "Public key (n, e) = (" + n + ", " + e + ")    Private key d = " + d + "\n\n";
    if (!(M >= 0 && M < n)) { out.innerHTML = s + "<span class='bad'>M অবশ্যই 0 ≤ M < n</span>"; return; }
    const C = modPow(M, e, n), M2 = modPow(C, d, n);
    s += "Encrypt: C = " + M + "^" + e + " mod " + n + " = <b>" + C + "</b>\nDecrypt: M = " + C + "^" + d + " mod " + n + " = <b>" + M2 + "</b> " + (Number(M2) === M ? "<span class='good'>✅</span>" : "");
    out.innerHTML = s;
  });

  on(["#sqx", "#sqy", "#sqn"], () => {
    const x = BigInt(Math.floor(+$("#sqx").value)), y = Math.floor(+$("#sqy").value), n = BigInt(Math.floor(+$("#sqn").value));
    if (!(y > 0) || n < 2n) { $("#sqout").textContent = "y > 0 এবং n ≥ 2 দাও"; return; }
    let s = "", cur = x % n, pw = 1;
    const table = [];
    while (pw <= y) { table.push([pw, cur]); pw *= 2; cur = cur * cur % n; }
    s += table.map(([p, v], i) => "x^" + String(p).padEnd(5) + " mod " + n + " = " + (i ? table[i - 1][1] + "² mod " + n + " = " : "") + v).join("\n");
    const bits = table.filter(([p]) => y & p).map(([p]) => p).reverse();
    s += "\n\n" + y + " = " + bits.join(" + ") + "  (binary " + y.toString(2) + ")\n";
    const used = table.filter(([p]) => y & p).map(([, v]) => v).reverse();
    let r = 1n; used.forEach(v => r = r * v % n);
    s += "x^" + y + " = " + bits.map(b => "x^" + b).join(" · ") + "\n      = " + used.join(" · ") + " mod " + n + " = <b>" + r + "</b>";
    s += "\nমোট গুণ ≈ " + (table.length - 1 + used.length - 1) + " টা (১২৩৪ বারের বদলে!)   যাচাই: " + modPow(x, y, n);
    $("#sqout").innerHTML = s;
  });

  on(["#xa", "#xn"], () => {
    const a = Math.floor(+$("#xa").value), b = Math.floor(+$("#xn").value);
    if (!(a > 0 && b > 0)) { $("#xout").textContent = "ধনাত্মক সংখ্যা দাও"; return; }
    const [d, i, j] = egcd(a, b);
    $("#xout").innerHTML = "Extended Euclid(" + a + ", " + b + ") → (d, i, j) = (" + d + ", " + i + ", " + j + ")\nযাচাই: " + i + "×" + a + " + (" + j + ")×" + b + " = " + (i * a + j * b) + "\n\n" +
      (d === 1 ? "d = 1 → " + a + "⁻¹ mod " + b + " = " + i + " mod " + b + " = <b>" + mod(i, b) + "</b>" : "<span class='bad'>d = " + d + " > 1 → " + a + "-এর Z" + b + "-এ inverse নেই</span>");
  });

  function fermat() {
    const n = Math.floor(+$("#ft").value);
    if (!(n > 4)) { $("#ftout").textContent = "n > 4 দাও"; return; }
    let s = "", composite = false;
    for (let t = 0; t < 5; t++) {
      const a = 2 + Math.floor(Math.random() * (n - 3));
      const r = modPow(a, n - 1, n);
      s += "a = " + a + ":  a^" + (n - 1) + " mod " + n + " = " + r + (r === 1n ? "  → pass" : "  → <span class='bad'>composite প্রমাণিত!</span>") + "\n";
      if (r !== 1n) composite = true;
    }
    s += "\nরায়: " + (composite ? "<span class='bad'>Composite</span>" : "সম্ভবত prime") + "     (আসল সত্য: " + (isPrime(n) ? "prime" : "composite") + ")";
    $("#ftout").innerHTML = s;
  }
  $("#ftgo").addEventListener("click", fermat); fermat();
})();
