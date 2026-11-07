/* Lecture 10: three-pass XOR protocol + eavesdropper */
(function () {
  const { $, esc } = window.INS;
  const hex = a => a.map(b => b.toString(16).padStart(2, "0")).join(" ");
  const xor = (a, b) => a.map((x, i) => x ^ b[i]);
  const txt = a => a.map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : "·")).join("");
  let msgs = null;
  function run() {
    const M = [...new TextEncoder().encode($("#xm").value || "SUST")];
    const Ka = Array.from(crypto.getRandomValues(new Uint8Array(M.length)));
    const Kb = Array.from(crypto.getRandomValues(new Uint8Array(M.length)));
    const m1 = xor(M, Ka), m2 = xor(m1, Kb), m3 = xor(m2, Ka);
    msgs = { M, Ka, Kb, m1, m2, m3 };
    $("#xout").innerHTML =
      "M  = " + hex(M) + "   (\"" + esc(txt(M)) + "\")\nKa = " + hex(Ka) + "   (A-এর গোপন)\nKb = " + hex(Kb) + "   (B-এর গোপন)\n\n" +
      "1. A → B : M⊕Ka          = " + hex(m1) + "\n2. B → A : M⊕Ka⊕Kb       = " + hex(m2) + "\n3. A → B : M⊕Ka⊕Kb⊕Ka    = " + hex(m3) + "   (= M⊕Kb)\n\n" +
      "B: m3 ⊕ Kb = " + hex(xor(m3, Kb)) + " = \"<span class='good'>" + esc(txt(xor(m3, Kb))) + "</span>\" ✅";
    $("#eout").textContent = "";
  }
  $("#xgo").addEventListener("click", run);
  $("#xm").addEventListener("input", run);
  $("#eve").addEventListener("click", () => {
    if (!msgs) run();
    const { m1, m2, m3 } = msgs;
    const Kb = xor(m1, m2), Ka = xor(m2, m3), M = xor(xor(m1, m2), m3);
    $("#eout").innerHTML = "Eve শুধু m1, m2, m3 রেকর্ড করেছে। এখন:\n" +
      "m1 ⊕ m2       = " + hex(Kb) + "  → <span class='bad'>Kb পেয়ে গেল!</span>\n" +
      "m2 ⊕ m3       = " + hex(Ka) + "  → <span class='bad'>Ka পেয়ে গেল!</span>\n" +
      "m1 ⊕ m2 ⊕ m3  = " + hex(M) + "  → <span class='bad'>M = \"" + esc(txt(M)) + "\"</span> 😱\n\nতাই XOR-এর এই সরল protocol নিরাপদ নয়।";
  });
  run();
})();
