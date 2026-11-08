/* Home page: per-lecture progress + glossary search */
(function () {
  const { $, $$, store, esc } = window.INS;
  function paint() {
    $$(".lec-card").forEach(c => {
      const L = c.dataset.l, done = store.get("ins-done-" + L, []).length, total = store.get("ins-total-" + L, 0);
      const pct = total ? Math.round(done / total * 100) : 0;
      $(".progress > i", c).style.width = pct + "%";
      c.title = total ? done + "/" + total + " অংশ পড়া শেষ" : "এখনো খোলা হয়নি";
    });
  }
  paint();
  $("#reset").addEventListener("click", () => {
    $$(".lec-card").forEach(c => store.set("ins-done-" + c.dataset.l, []));
    paint();
  });

  const G = [
    ["Computer security", "adversarial environment-এ সিস্টেম রক্ষা: intended use হ্যাঁ, unintended না", "L1"],
    ["CIA triad", "Confidentiality · Integrity · Availability", "L1"],
    ["Secrecy / Privacy", "Confidentiality-র দুই মাত্রা", "L1"],
    ["Authentication factors", "has · knows · is", "L1"],
    ["Faraday cage", "copper mesh-এর ঘর — EM সিগন্যাল আটকায়", "L1"],
    ["Assurance", "Policy · Permission · Protection দিয়ে trust management", "L1"],
    ["Anonymity tools", "Aggregation · Mixing · Proxy · Pseudonym", "L1"],
    ["Masquerading", "অন্যের নামে তথ্য বানানো (active)", "L1"],
    ["Repudiation", "প্রতিশ্রুতি/প্রাপ্তি অস্বীকার", "L1"],
    ["Economy of mechanism", "সিকিউরিটি ডিজাইন সহজ রাখা", "L3"],
    ["Fail-safe defaults", "ডিফল্টে ন্যূনতম অধিকার", "L3"],
    ["Complete mediation", "প্রতিটা access চেক করা", "L3"],
    ["Open design / Kerckhoffs", "অ্যালগরিদম পাবলিক, শুধু key গোপন", "L3"],
    ["Security by obscurity", "অ্যালগরিদম লুকিয়ে নিরাপত্তা — ব্যর্থ পদ্ধতি", "L3"],
    ["Separation of privilege", "একাধিক শর্ত/দুই চাবি", "L3"],
    ["Least privilege", "কাজের জন্য ন্যূনতম অধিকার (need-to-know)", "L3"],
    ["Least common mechanism", "শেয়ার্ড মেকানিজম কমানো", "L3"],
    ["Psychological acceptability", "ব্যবহারবান্ধব সিকিউরিটি", "L3"],
    ["Work factor", "ভাঙার খরচ বনাম attacker-এর সামর্থ্য", "L3"],
    ["Compromise recording", "অনুপ্রবেশ রেকর্ড রাখা (log, CCTV)", "L3"],
    ["Access control matrix", "subject × object টেবিল; n×m সেল", "L3"],
    ["ACL", "প্রতিটা object-এর সাথে কার কী অধিকার — matrix-এর কলাম", "L3"],
    ["Capability", "প্রতিটা subject-এর অধিকারের তালিকা — matrix-এর সারি", "L3"],
    ["RBAC", "Role-কে অধিকার, user-কে role; inheritance", "L3"],
    ["Plaintext / Ciphertext", "আসল বার্তা / এনক্রিপ্টেড বার্তা", "L4"],
    ["Caesar cipher", "৩ ঘর shift; s(c,k)", "L4"],
    ["n(n−1)/2", "symmetric-এ n জনের জন্য key সংখ্যা", "L4"],
    ["Hybrid encryption", "public-key দিয়ে session key, তারপর symmetric", "L4"],
    ["MITM", "মাঝখানে বসে দেখা/বদলানো/যোগ/মোছা", "L4"],
    ["Unicity distance", "n = k/(1−α); অনন্য অর্থবহ plaintext-এর জন্য ন্যূনতম ciphertext দৈর্ঘ্য", "L4"],
    ["Entropy of English", "প্রতি অক্ষরে ≈1.25 bit", "L4"],
    ["Hash function", "one-way, collision-resistant digest (SHA-256)", "L5"],
    ["MAC", "A = h(K‖M) — shared key দিয়ে integrity+authenticity", "L5"],
    ["Digital certificate / CA", "CA-র সই করা পরিচয় + public key", "L5"],
    ["Dictionary attack", "<100,000 সাধারণ password চেষ্টা", "L5"],
    ["Pretexting / Baiting / Quid pro quo", "বানানো গল্প / লোভনীয় উপহার / কিছুর বিনিময়ে কিছু", "L5"],
    ["Cryptanalysis", "cryptosystem আক্রমণের বিজ্ঞান", "L6"],
    ["Ciphertext-only / Known-plaintext / Chosen-plaintext / Chosen-ciphertext", "attacker কী তথ্য পায় তার ভিত্তিতে ৪ আক্রমণ", "L6"],
    ["Frequency analysis", "E≈12%, T≈9% — substitution ভাঙার উপায়", "L6"],
    ["S-box", "substitution box — টেবিল দিয়ে প্রতিস্থাপন", "L6"],
    ["Vigenère", "m টা shift পালাক্রমে", "L6"],
    ["One-time pad", "র‍্যান্ডম, বার্তার সমান লম্বা, একবার ব্যবহারযোগ্য key — perfect security", "L6"],
    ["Hill cipher", "c = K·x mod 26", "L6"],
    ["PKCS5 padding", "প্রতিটা padding byte-এর মান = padding দৈর্ঘ্য", "L6"],
    ["ECB / CBC / CFB / OFB", "block cipher-এর mode of operation", "L6"],
    ["DES / 3DES", "56-bit key, 64-bit block / E-D-E তিন key", "L7"],
    ["AES", "128-bit block; 128/192/256 key; 10/12/14 round", "L7"],
    ["SubBytes / ShiftRows / MixColumns / AddRoundKey", "AES round-এর ৪ ধাপ", "L7"],
    ["Key expansion", "44/52/60 word; g() = RotWord+SubWord+Rcon", "L7"],
    ["Side-channel / Timing attack", "implementation-এর সময়/বিদ্যুৎ থেকে key ফাঁস", "L7"],
    ["GCD / Euclid", "gcd(a,b) = gcd(b, a mod b)", "L8"],
    ["Multiplicative inverse", "x·y mod n = 1; থাকে যদি gcd(x,n)=1", "L8"],
    ["Fermat's little theorem", "x^(p−1) mod p = 1", "L8"],
    ["Euler's theorem / Φ(n)", "x^Φ(n) mod n = 1; Φ(pq)=(p−1)(q−1)", "L8"],
    ["RSA", "C = M^e mod n, M = C^d mod n", "L8"],
    ["Repeated squaring", "x^y mod n — ≤2·log₂y গুণ", "L8"],
    ["Extended Euclid", "ia + jb = gcd(a,b); inverse বের করা", "L8"],
    ["Fermat primality test", "a^(n−1) mod n ≠ 1 ⇒ composite", "L8"],
    ["Generator / Primitive root", "যার power সব nonzero মান দেয়", "L9"],
    ["Discrete logarithm", "x = g^k mod p থেকে k বের করা — কঠিন", "L9"],
    ["Elgamal", "a = g^k, b = M·y^k mod p — randomized", "L9"],
    ["Diffie-Hellman", "K = g^(xy) mod p", "L9"],
    ["Weak / Strong collision resistance", "নির্দিষ্ট M-এর সাথে / যেকোনো দুটোর মধ্যে collision কঠিন", "L9"],
    ["Merkle–Damgård", "d_i = C(M_i, d_(i−1)); IV দিয়ে শুরু", "L9"],
    ["Birthday attack", "23 জন → 50.7%; collision ≈ 2^(n/2) চেষ্টায়", "L9"],
    ["Nonforgeability / Nonmutability / Non-repudiation", "digital signature-এর ৩ গুণ", "L9"],
    ["Protocol", "লক্ষ্য অর্জনের জন্য কাঠামোবদ্ধ সংলাপ", "L10"],
    ["Commutative cipher", "{{M}K1}K2 = {{M}K2}K1 — যেমন XOR", "L10"],
    ["Unicity (protocol goal)", "secret ঠিক দুই পক্ষের মধ্যে", "L10"],
    ["Replay / Interleaving / Known-key / Impersonation", "protocol আক্রমণের ধরন", "L10"],
    ["Nonce (r_A) / Timestamp (t_A)", "replay ঠেকানোর উপাদান", "L10"],
    ["HTTP (stateless)", "TCP port 80; server আগের request মনে রাখে না", "L19"],
    ["GET vs POST", "input URL-এ বনাম entity body-তে", "L19"],
    ["Status codes", "200 OK · 301 Moved · 400 Bad · 404 Not Found · 505", "L19"],
    ["Cookie (4 components)", "Set-Cookie · Cookie header · browser ফাইল · backend DB", "L19"],
    ["DNS servers", "Root · TLD · Authoritative · Local (default)", "L19"],
    ["SMTP", "TCP 25; handshake–transfer–closure; 7-bit ASCII", "L19"],
    ["POP / IMAP", "mail retrieval protocol; IMAP বেশি ফিচার", "L19"],
    ["Interception / Modification / Fabrication / Interruption", "C / I / I / A ভাঙে", "L20"],
    ["Packet sniffing", "নেটওয়ার্কের packet পড়া; সমাধান encryption", "L20"],
    ["ARP watch", "ARP cache-এ duplicate খোঁজে; DHCP-তে false alarm", "L20"],
    ["Ping sweep / Port scan / Fingerprinting", "live host / খোলা port / OS শনাক্ত — nmap", "L20"],
    ["ARP spoofing", "authentication-হীন ARP-এ ভুয়া reply → MITM", "L20"],
    ["Blind / Non-blind IP spoofing", "seq আন্দাজ / একই subnet-এ sniff করে", "L20"],
    ["IP traceback", "packet-এর আসল উৎস খোঁজা", "L20"],
    ["TCP sequence prediction", "ISN আন্দাজ করে spoofed session", "L21"],
    ["Ping flood", "দুই শর্ত: বেশি request + victim-এর যথেষ্ট bandwidth", "L21"],
    ["Smurf attack", "spoofed src দিয়ে broadcast-এ ping → amplification", "L21"],
    ["SYN flood", "SYN পাঠিয়ে ACK না দেওয়া → backlog পূর্ণ", "L21"],
    ["SYN cookie", "state sequence number-এ hash করে রাখা", "L21"],
    ["DDoS / Botnet", "অনেক আপোষকৃত মেশিন দিয়ে DoS", "L21"],
    ["DNS cache poisoning", "LDNS cache-এ ভুয়া mapping", "L21"],
    ["HTTPS / TLS", "HTTP + SSL/TLS: certificate + encrypted channel + MAC", "L24"],
    ["Root certificate", "self-signed; trust anchor", "L24"],
    ["EV certificate", "CA/Browser Forum-এর কঠোর পরিচয় যাচাই", "L24"],
    ["CRL", "Certificate Revocation List — বাতিল serial number", "L24"],
    ["Semantic attack", "0ntest.com — মানুষের অর্থ বোঝাকে লক্ষ্য", "L24"],
    ["DOM", "page-এর object tree; script access করে", "L24"],
    ["Hidden field", "GET/POST দিয়ে session তথ্য — HTTPS ছাড়া অনিরাপদ", "L24"],
    ["Secure / HttpOnly flag", "শুধু HTTPS / script পড়তে পারবে না", "L25"],
    ["Session ID / token", "random বা MAC দিয়ে, আন্দাজ-অযোগ্য", "L25"],
    ["Phishing", "ভুয়া page দিয়ে তথ্য হাতানো", "L25"],
    ["Homograph attack", "Unicode look-alike (Cyrillic р U+0440)", "L25"],
    ["Click-jacking / Click fraud", "অনিচ্ছাকৃত ক্লিক / বিজ্ঞাপনে জাল ক্লিক", "L25"],
    ["Sandbox", "অ্যাপ/script-এর সীমিত অধিকার", "L25"],
    ["ActiveX vs Java applet", "binary, sandbox-বিহীন বনাম sandboxed", "L25"],
    ["Third-party cookie", "embedded কনটেন্টের সাইটের cookie — tracking", "L25"],
    ["XSS (persistent / reflected)", "সাইটে inject করা script অন্যের browser-এ চলে", "L26"],
    ["CSRF", "সাইটের user-এর প্রতি বিশ্বাস কাজে লাগায়", "L26"],
    ["Login CSRF", "user-কে attacker-এর অ্যাকাউন্টে login করানো", "L26"],
    ["RFI / LFI", "remote / local ফাইল include করে চালানো", "L26"],
    ["Null byte %00", "string শেষ — পরের .php উপেক্ষা", "L26"],
    ["SQL injection", "' OR '1'='1 — unsanitized input query-তে", "L26"]
  ];
  const lecFile = L => "lecture" + L.slice(1) + ".html";
  function render() {
    const q = $("#gq").value.trim().toLowerCase();
    const rows = G.filter(([t, d]) => !q || (t + " " + d).toLowerCase().includes(q));
    $("#gloss").innerHTML = "<tr><th>শব্দ</th><th>অর্থ</th><th>লেকচার</th></tr>" +
      (rows.map(([t, d, L]) => "<tr><td><b>" + esc(t) + "</b></td><td>" + esc(d) + '</td><td><a href="' + lecFile(L) + '">' + L + "</a></td></tr>").join("") || '<tr><td colspan="3">কিছু পাওয়া যায়নি</td></tr>');
  }
  $("#gq").addEventListener("input", render); render();
})();
