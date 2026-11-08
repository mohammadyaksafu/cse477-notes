/* Lecture 19: GET vs POST request builder + iterated DNS lookup with caching */
(function () {
  const { $, esc } = window.INS;
  const enc = s => encodeURIComponent(s);
  function req(method) {
    const u = $("#ru").value, p = $("#rp").value, body = "username=" + enc(u) + "&password=" + enc(p);
    const out = method === "GET"
      ? "GET <span class='bad'>/user?" + esc(body) + "</span> HTTP/1.1\nHost: www.someserver.com\nUser-Agent: Firefox\n\n(body খালি)\n\n⚠️ Password URL-এ — address bar, history, server log সব জায়গায় দেখা যাবে।"
      : "POST /user HTTP/1.1\nHost: www.someserver.com\nContent-Type: application/x-www-form-urlencoded\nContent-Length: " + body.length + "\n\n<span class='hl'>" + esc(body) + "</span>\n\nURL পরিষ্কার, কিন্তু HTTP-তে body-ও plaintext — sniffer পড়তে পারবে।";
    $("#rout").innerHTML = out;
  }
  $("#rget").addEventListener("click", () => req("GET"));
  $("#rpost").addEventListener("click", () => req("POST"));
  req("GET");

  const IPS = { "gaia.cs.umass.edu": "128.119.245.12", "www.amazon.com": "205.251.242.103", "www.sust.edu": "103.84.159.2" };
  const cache = {};
  let steps = [], i = 0, cur = "";
  function plan(name) {
    const parts = name.split("."), tld = parts[parts.length - 1], dom = parts.slice(-2).join(".");
    if (cache[name]) return ["host → local DNS: " + name + " কোথায়?", "local DNS: <span class='good'>cache hit!</span> " + name + " = " + IPS[name] + " (root/TLD/authoritative কাউকে লাগেনি)"];
    const s = ["host → local DNS (dns.cs.vt.edu): " + name + " কোথায়?  [recursive query]"];
    if (cache["." + tld]) s.push("local DNS: ." + tld + " TLD সার্ভারের ঠিকানা cache-এ আছে — root বাদ!");
    else s.push("local DNS → root server: ." + tld + " কে দেখে?", "root → local DNS: ." + tld + " TLD server-এ যাও");
    s.push("local DNS → ." + tld + " TLD server: " + dom + " কে দেখে?", "TLD → local DNS: authoritative server dns." + dom + "-এ যাও",
      "local DNS → dns." + dom + ": " + name + "?", "authoritative → local DNS: " + name + " = <span class='good'>" + IPS[name] + "</span>",
      "local DNS → host: " + IPS[name] + "  (আর mapping cache-এ রেখে দিল)");
    return s;
  }
  function reset() { cur = $("#dq").value; steps = plan(cur); i = 0; $("#dout").innerHTML = "“পরের ধাপ” চাপো…"; }
  $("#dgo").addEventListener("click", () => {
    if ($("#dq").value !== cur || i >= steps.length) reset();
    i++;
    $("#dout").innerHTML = steps.slice(0, i).map((s, k) => (k + 1) + ". " + s).join("\n");
    if (i === steps.length) { cache[cur] = true; cache["." + cur.split(".").pop()] = true; }
  });
  $("#dreset").addEventListener("click", () => { for (const k in cache) delete cache[k]; reset(); $("#dout").innerHTML = "Cache খালি করা হলো।"; });
  $("#dq").addEventListener("change", reset);
  reset();
})();
