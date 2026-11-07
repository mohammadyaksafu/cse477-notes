/* Lecture 3 labs: access control views + RBAC + matrix size */
(function () {
  const { $, esc } = window.INS;
  const subjects = ["Alice", "Bob", "Charlie", "root"];
  const objects = ["notes.txt", "grades.xls", "run.sh", "/etc/passwd"];
  const cycle = ["", "r", "rw", "rwx"];
  const M = {
    Alice: { "notes.txt": "rw", "grades.xls": "r", "run.sh": "rwx", "/etc/passwd": "r" },
    Bob: { "notes.txt": "r", "grades.xls": "", "run.sh": "r", "/etc/passwd": "r" },
    Charlie: { "notes.txt": "", "grades.xls": "rw", "run.sh": "", "/etc/passwd": "r" },
    root: { "notes.txt": "rw", "grades.xls": "rw", "run.sh": "rwx", "/etc/passwd": "rw" }
  };
  const table = $("#acm");
  function render() {
    let h = "<tr><th>Subject ↓ / Object →</th>" + objects.map(o => '<th class="c">' + esc(o) + "</th>").join("") + "</tr>";
    subjects.forEach(s => {
      h += "<tr><th>" + s + "</th>" + objects.map(o => '<td class="c" style="cursor:pointer" data-s="' + s + '" data-o="' + esc(o) + '">' + (M[s][o] || "—") + "</td>").join("") + "</tr>";
    });
    table.innerHTML = h;
    // ACL: per object
    $("#acl-out").textContent = objects.map(o => o.padEnd(12) + " → " + (subjects.filter(s => M[s][o]).map(s => s + ":" + M[s][o]).join(", ") || "(কেউ না)")).join("\n");
    $("#cap-out").textContent = subjects.map(s => s.padEnd(8) + " → " + (objects.filter(o => M[s][o]).map(o => o + ":" + M[s][o]).join(", ") || "(কিছুই না)")).join("\n");
  }
  table.addEventListener("click", e => {
    const td = e.target.closest("td[data-s]"); if (!td) return;
    const s = td.dataset.s, o = td.dataset.o;
    M[s][o] = cycle[(cycle.indexOf(M[s][o]) + 1) % cycle.length]; render();
  });
  render();

  $("#q-alice").addEventListener("click", () => {
    const rights = objects.filter(o => M.Alice[o]).map(o => o + ":" + M.Alice[o]).join(", ");
    $("#ac-cost").innerHTML = "উত্তর: " + esc(rights) + "\n\n" +
      "Matrix     → Alice-এর <b>১টা সারি</b> পড়লেই হলো (" + objects.length + " সেল)\n" +
      "Capability → Alice-এর <b>১টা তালিকা</b> ✅ দ্রুততম\n" +
      "ACL        → <span class='bad'>সব " + objects.length + "টা object-এর ACL</span> ঘাঁটতে হবে ❌ (বাস্তবে লক্ষ লক্ষ ফাইল!)";
  });
  $("#q-file").addEventListener("click", () => {
    const who = subjects.filter(s => M[s]["grades.xls"]).map(s => s + ":" + M[s]["grades.xls"]).join(", ");
    $("#ac-cost").innerHTML = "উত্তর: " + esc(who || "কেউ না") + "\n\n" +
      "Matrix     → grades.xls-এর <b>১টা কলাম</b>\n" +
      "ACL        → grades.xls-এর <b>১টা তালিকা</b> ✅ দ্রুততম (ফাইলের সাথেই থাকে)\n" +
      "Capability → <span class='bad'>সব " + subjects.length + " জন subject-এর তালিকা</span> ঘাঁটতে হবে ❌";
  });

  // matrix size
  const fmt = n => n.toLocaleString("en-US");
  function size() {
    const n = Math.max(0, +$("#mn").value || 0), m = Math.max(0, +$("#mm").value || 0);
    const cells = n * m;
    const secs = cells; // 1 cell per second
    const years = secs / (3600 * 24 * 365);
    $("#msize").innerHTML = "সেল সংখ্যা = " + fmt(n) + " × " + fmt(m) + " = <b>" + fmt(cells) + "</b>\n" +
      "প্রতি সেকেন্ডে ১টা সেল পূরণ করলে লাগবে ≈ <span class='hl'>" + years.toFixed(1) + " বছর</span> 😵";
  }
  $("#mn").addEventListener("input", size); $("#mm").addEventListener("input", size); size();

  // RBAC
  const roles = {
    member: { label: "Department Member", rights: ["notice board: read", "library portal: read"], parent: null },
    student: { label: "Student", rights: ["course materials: read", "assignment box: write"], parent: "member" },
    faculty: { label: "Faculty", rights: ["course materials: write", "grades: write"], parent: "member" },
    chair: { label: "Department Chair", rights: ["budget: read/write", "faculty evaluations: read"], parent: "faculty" },
    sysadmin: { label: "System Administrator", rights: ["servers: rwx", "backups: rw"], parent: "member" }
  };
  function rb() {
    let r = $("#rb-role").value, lines = [], chain = [];
    while (r) { const R = roles[r]; chain.push(R.label); R.rights.forEach(x => lines.push("• " + x + (chain.length > 1 ? "   ← inherited from " + R.label : ""))); r = R.parent; }
    $("#rb-out").textContent = "Role hierarchy: " + chain.join(" → ") + "\n\nমোট অধিকার:\n" + lines.join("\n");
  }
  $("#rb-role").addEventListener("change", rb); rb();
})();
