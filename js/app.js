/* ===== shared behaviour for every lecture page ===== */
(function () {
  "use strict";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: ignore */ } }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const saved = store.get("ins-theme", null);
  if (saved) root.dataset.theme = saved;
  $$("[data-theme-toggle]").forEach(b => b.addEventListener("click", () => {
    const cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.dataset.theme = next; store.set("ins-theme", next);
  }));

  /* ---------- TOC + done tracking ---------- */
  const lec = document.body.dataset.lecture;
  const secs = $$("main section.topic[id]");
  const toc = $("#toc");
  const doneKey = "ins-done-" + lec;
  let done = new Set(store.get(doneKey, []));
  if (lec) store.set("ins-total-" + lec, secs.length);

  function refreshProgress() {
    const pct = secs.length ? Math.round(done.size / secs.length * 100) : 0;
    const bar = $(".topbar .progress > i"); if (bar) bar.style.width = pct + "%";
    const lab = $(".progress-label"); if (lab) lab.textContent = done.size + "/" + secs.length + " পড়া শেষ";
    $$("#toc a").forEach(a => { const t = a.querySelector(".tick"); if (t) t.textContent = done.has(a.dataset.id) ? "✔" : "•"; });
  }
  secs.forEach((s, i) => {
    const h = s.querySelector("h2");
    if (toc && h) {
      const li = document.createElement("li");
      li.innerHTML = '<a href="#' + s.id + '" data-id="' + s.id + '"><span class="tick">•</span><span>' + (i + 1) + ". " + h.textContent.replace(/\(.*?\)/g, "").trim() + "</span></a>";
      toc.appendChild(li);
    }
    if (lec) {
      const row = document.createElement("div"); row.className = "done-row";
      const b = document.createElement("button"); b.className = "done-btn"; b.type = "button";
      const paint = () => { b.classList.toggle("on", done.has(s.id)); b.textContent = done.has(s.id) ? "✔ পড়া শেষ" : "এই অংশ পড়া শেষ? ক্লিক করো"; };
      b.addEventListener("click", () => { done.has(s.id) ? done.delete(s.id) : done.add(s.id); store.set(doneKey, [...done]); paint(); refreshProgress(); });
      paint(); row.appendChild(b); s.appendChild(row);
    }
  });
  refreshProgress();

  // scroll spy
  if (toc && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) $$("#toc a").forEach(a => a.classList.toggle("active", a.dataset.id === e.target.id));
    }), { rootMargin: "-30% 0px -60% 0px" });
    secs.forEach(s => io.observe(s));
  }

  /* ---------- tabs ---------- */
  $$(".tabs").forEach(t => {
    const btns = $$(":scope > .tab-btns button", t), panes = $$(":scope > .tab-pane", t);
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("on")); panes.forEach(x => x.hidden = true);
      b.classList.add("on"); panes[i].hidden = false;
    }));
    if (btns[0]) btns[0].click();
  });

  /* ---------- flash cards ---------- */
  $$(".flash").forEach(f => {
    const front = f.dataset.front, back = f.dataset.back;
    if (front) f.innerHTML = '<div class="fi"><div class="front">' + front + '</div><div class="back">' + back + "</div></div>";
    f.tabIndex = 0;
    f.addEventListener("click", () => f.classList.toggle("flipped"));
    f.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f.classList.toggle("flipped"); } });
  });

  /* ---------- quizzes ---------- */
  const quizzes = $$(".quiz");
  let right = 0, answered = 0;
  const scoreBox = $(".score-box");
  const paintScore = () => { if (scoreBox) scoreBox.textContent = "কুইজ স্কোর: " + right + " / " + answered + " (মোট " + quizzes.length + ")"; };
  quizzes.forEach(q => {
    const ans = +q.dataset.answer;
    const opts = $$(".opt", q), exp = $(".explain", q);
    if (exp) exp.hidden = true;
    opts.forEach((o, i) => { o.type = "button"; o.addEventListener("click", () => {
      if (q.classList.contains("answered")) return;
      q.classList.add("answered"); answered++;
      if (i === ans) right++; else o.classList.add("wrong");
      opts[ans].classList.add("right");
      if (exp) exp.hidden = false;
      paintScore();
    }); });
  });
  paintScore();

  /* ---------- steppers ---------- */
  $$(".stepper").forEach(st => {
    const steps = $$(":scope > .step", st);
    let i = 0;
    const nav = document.createElement("div"); nav.className = "nav";
    nav.innerHTML = '<button class="btn ghost" type="button">← আগের ধাপ</button><button class="btn" type="button">পরের ধাপ →</button><span class="count"></span>';
    st.appendChild(nav);
    const [prev, next] = $$("button", nav), count = $(".count", nav);
    const show = () => { steps.forEach((s, k) => s.classList.toggle("on", k === i)); prev.disabled = i === 0; next.disabled = i === steps.length - 1; count.textContent = "ধাপ " + (i + 1) + " / " + steps.length; };
    prev.addEventListener("click", () => { if (i > 0) { i--; show(); } });
    next.addEventListener("click", () => { if (i < steps.length - 1) { i++; show(); } });
    show();
  });

  /* ---------- math helpers used by lecture labs ---------- */
  const B = x => BigInt(x);
  const mod = (a, n) => ((a % n) + n) % n;
  const modB = (a, n) => ((a % n) + n) % n;
  function modPow(b, e, m) { b = modB(B(b), B(m)); e = B(e); m = B(m); let r = 1n; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function egcd(a, b) { // returns [d,i,j] with i*a + j*b = d
    if (b === 0) return [a, 1, 0];
    const [d, i, j] = egcd(b, a % b); return [d, j, i - Math.floor(a / b) * j];
  }
  function inv(x, n) { const [d, i] = egcd(mod(x, n), n); return d === 1 ? mod(i, n) : null; }
  function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const bn = n => String(n).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[d]);
  const caesar = (txt, k) => txt.replace(/[a-z]/gi, ch => { const b = ch <= "Z" ? 65 : 97; return String.fromCharCode(mod(ch.charCodeAt(0) - b + k, 26) + b); });
  window.INS = { store, $, $$, mod, modPow, gcd, egcd, inv, isPrime, esc, bn, caesar };
})();
