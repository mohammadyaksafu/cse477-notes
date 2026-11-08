/* Lecture 20: simulated ping sweep / port scan + ARP poisoning */
(function () {
  const { $ } = window.INS;
  const NET = {
    "192.168.1.1": { os: "Router firmware (Linux)", ports: { 53: "DNS", 80: "HTTP (admin panel)" } },
    "192.168.1.5": { os: "Windows 10", ports: { 135: "RPC", 445: "SMB" } },
    "192.168.1.9": { os: "Ubuntu Linux", ports: { 21: "FTP", 22: "SSH", 25: "SMTP", 80: "HTTP" } },
    "192.168.1.12": { os: "Printer (embedded)", ports: { 9100: "JetDirect", 80: "HTTP" } }
  };
  const COMMON = [21, 22, 25, 53, 80, 135, 443, 445, 3306, 9100];
  let found = [];
  $("#sweep").addEventListener("click", () => {
    const lines = ["$ nmap -sn 192.168.1.0/28   (ICMP ECHO request প্রত্যেককে)"];
    found = [];
    for (let i = 1; i <= 14; i++) {
      const ip = "192.168.1." + i;
      if (NET[ip]) { found.push(ip); lines.push(ip + "  ← <span class='good'>ECHO reply — host is up</span>"); }
      else lines.push(ip + "  … কোনো উত্তর নেই");
    }
    lines.push("\n" + found.length + " টা live host পাওয়া গেল। এখন একটা বেছে port scan করো।");
    $("#sout").innerHTML = lines.join("\n");
    $("#phost").innerHTML = found.map(ip => "<option>" + ip + "</option>").join("");
  });
  $("#pscan").addEventListener("click", () => {
    const ip = $("#phost").value;
    if (!ip) { $("#sout").textContent = "আগে ping sweep চালাও।"; return; }
    const h = NET[ip], lines = ["$ nmap -O " + ip + "   (প্রতিটা দরজায় টোকা)", "PORT     STATE    SERVICE"];
    COMMON.forEach(p => lines.push(String(p).padEnd(9) + (h.ports[p] ? "<span class='bad'>open</span>     " + h.ports[p] : "closed")));
    lines.push("\nOS fingerprint: " + h.os);
    if (h.ports[21] || h.ports[25] && !h.ports[443]) lines.push("⚠️ FTP/SMTP plaintext সার্ভিস খোলা — attacker-এর জন্য সম্ভাব্য প্রবেশপথ।");
    $("#sout").innerHTML = lines.join("\n");
  });

  const A = { gwIP: "192.168.1.1", gwMAC: "aa:aa:aa:aa:aa:01", vIP: "192.168.1.5", attIP: "192.168.1.66", attMAC: "ee:ee:ee:ee:ee:66" };
  let cache = {}, poisoned = false;
  const table = () => "Victim (" + A.vIP + ")-এর ARP cache:\n  IP              MAC\n" +
    Object.entries(cache).map(([ip, mac]) => "  " + ip.padEnd(16) + (mac === A.attMAC ? "<span class='bad'>" + mac + "</span>" : mac)).join("\n");
  $("#anormal").addEventListener("click", () => {
    cache = { [A.gwIP]: A.gwMAC, [A.attIP]: A.attMAC }; poisoned = false;
    $("#aout").innerHTML = "Victim: “Who has " + A.gwIP + "? Tell " + A.vIP + "”  (broadcast)\nGateway: “" + A.gwIP + " is at " + A.gwMAC + "”\n\n" + table() + "\n\n<span class='good'>ইন্টারনেটের ট্রাফিক সরাসরি gateway-তে যাচ্ছে ✅</span>";
  });
  $("#aspoof").addEventListener("click", () => {
    if (!cache[A.gwIP]) $("#anormal").click();
    cache[A.gwIP] = A.attMAC; poisoned = true;
    $("#aout").innerHTML = "😈 Attacker (কেউ জিজ্ঞেস করেনি তবু): “" + A.gwIP + " is at " + A.attMAC + "”\nVictim যাচাই ছাড়াই cache আপডেট করল!\n\n" + table() +
      "\n\n<span class='bad'>এখন victim-এর সব ট্রাফিক আগে attacker-এর কাছে যাবে → sniff/modify করে gateway-তে পাঠাবে (MITM)।</span>";
  });
  $("#awatch").addEventListener("click", () => {
    if (!Object.keys(cache).length) $("#anormal").click();
    const seen = {}; Object.entries(cache).forEach(([ip, mac]) => (seen[mac] = seen[mac] || []).push(ip));
    const dup = Object.entries(seen).filter(([, ips]) => ips.length > 1);
    $("#aout").innerHTML = table() + "\n\nARP watch: " + (dup.length
      ? "<span class='bad'>🔔 ALARM! MAC " + dup[0][0] + " একাধিক IP-র জন্য: " + dup[0][1].join(", ") + "</span>\n(সতর্কতা: DHCP নেটওয়ার্কে এমন false alarm-ও হয়।)"
      : "<span class='good'>কোনো duplicate নেই ✅</span>" + (poisoned ? "" : ""));
  });
  $("#anormal").click();
})();
