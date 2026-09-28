/* The Hope Group · site interactions. No dependencies, no tracking. */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const drawer = $("#drawer");
  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle__label").textContent = open ? "Close" : "Menu";
      if (open) { const hdr = $(".site-header"); drawer.style.top = `${Math.max(0, hdr ? hdr.getBoundingClientRect().bottom : 68)}px`; }
      drawer.hidden = !open;
      document.body.classList.toggle("drawer-open", open);
      if (open) { const first = drawer.querySelector("a"); first && first.focus(); }
    };
    toggle.addEventListener("click", () => setOpen(drawer.hidden));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) { setOpen(false); toggle.focus(); } });
    window.matchMedia("(min-width: 1181px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Boston, connected: neighborhoods light up their neighbors ---------- */
  const canvas = $("#neighborhood");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    // name, x, y (0-100, north up), relative size, label side (n/s/e/w)
    const HOODS = [
      ["Charlestown", 52, 9, 1.0, "n"], ["East Boston", 73, 11, 1.1, "n"], ["North End", 60, 22, 0.6, "e"], ["Beacon Hill", 48, 27, 0.5, "w"],
      ["Downtown", 56, 31, 0.8, "e"], ["Seaport", 67, 36, 0.7, "e"], ["Back Bay", 42, 35, 0.8, "w"], ["Chinatown", 53, 38, 0.5, "s"],
      ["Fenway", 34, 39, 0.8, "w"], ["Allston", 24, 31, 0.9, "n"], ["Brighton", 13, 34, 1.0, "w"], ["South End", 48, 44, 0.8, "s"],
      ["South Boston", 67, 45, 1.1, "e"], ["Mission Hill", 37, 48, 0.6, "w"], ["Roxbury", 46, 54, 1.2, "s"], ["Jamaica Plain", 33, 60, 1.1, "w"],
      ["Dorchester", 62, 63, 1.6, "e"], ["Roslindale", 31, 72, 0.9, "w"], ["Mattapan", 51, 77, 1.0, "e"], ["West Roxbury", 19, 76, 1.0, "w"], ["Hyde Park", 36, 89, 1.0, "s"],
    ];
    const INK = [23, 25, 28], MAG = [196, 30, 92];
    const mix = (a, b, t) => `${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)}`;
    let W = 0, H = 0, dots = [], pairs = [], hoods = [], raf = 0, running = false, last = 0, lastRipple = -1e9;
    const ripples = [];
    const mouse = { x: -1e4, y: -1e4 };
    let seed = 617;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wide = W > 900;
      const region = wide ? { x: W * 0.40, y: H * 0.05, w: W * 0.57, h: H * 0.8 } : { x: W * 0.05, y: H * 0.06, w: W * 0.90, h: H * 0.88 };
      const scale = Math.min(region.w / 100, region.h / 100);
      const ox = region.x + (region.w - 100 * scale) / 2, oy = region.y + (region.h - 100 * scale) / 2;
      seed = 617; dots = []; pairs = []; hoods = [];
      const per = Math.max(10, Math.min(30, scale * 3.4));
      HOODS.forEach(([name, x, y, wgt, side], hi) => {
        const cx = ox + x * scale, cy = oy + y * scale, r = Math.sqrt(wgt) * scale * 6.4;
        const n = Math.round(per * wgt), start = dots.length;
        for (let i = 0; i < n; i++) {
          const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r;
          dots.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: 1.1 + rnd() * 1.3, lit: 0, target: 0, h: hi });
        }
        hoods.push({ name: name.toUpperCase(), cx, cy, r, wgt, side, start, end: dots.length, lit: 0, wide });
      });
      // the subtitle sits just under the drawn neighborhoods
      const heroEl = canvas.closest(".hero3");
      if (heroEl) {
        const mapBottom = Math.max(...hoods.map((h) => h.cy + h.r + (h.side === "s" ? 18 : 0)));
        heroEl.style.setProperty("--map-cx", `${ox + 50 * scale}px`);
        heroEl.style.setProperty("--map-bottom", `${Math.round(mapBottom + 14)}px`);
        heroEl.classList.add("has-map");
      }
      for (const h of hoods) {
        const link = h.r * 0.8;
        for (let i = h.start; i < h.end; i++) for (let j = i + 1; j < h.end; j++) {
          const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (d < link) pairs.push([i, j, d / link]);
        }
      }
      const linked = new Set();
      hoods.forEach((h, hi) => {
        hoods.map((o, oi) => [oi, Math.hypot(o.cx - h.cx, o.cy - h.cy)]).filter((e) => e[0] !== hi).sort((a, b) => a[1] - b[1]).slice(0, 3).forEach(([oi]) => {
          const key = hi < oi ? `${hi}-${oi}` : `${oi}-${hi}`;
          if (linked.has(key)) return; linked.add(key);
          const o = hoods[oi], cands = [];
          for (let i = h.start; i < h.end; i++) for (let j = o.start; j < o.end; j++) cands.push([i, j, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y)]);
          cands.sort((a, b) => a[2] - b[2]).slice(0, 2).forEach(([i, j]) => pairs.push([i, j, 0.55]));
        });
      });
    }

    function draw(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      if (!reduceMotion && now - lastRipple > 3200 && hoods.length) {
        const h = hoods[Math.floor(Math.random() * hoods.length)];
        ripples.push({ x: h.cx, y: h.cy, t: 0 }); lastRipple = now;
      }
      for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += dt; if (ripples[i].t > 1.8) ripples.splice(i, 1); }
      const reach = Math.min(W, H) * 0.14;
      for (const p of dots) {
        let l = 0;
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < reach) l = 1 - md / reach;
        for (const r of ripples) {
          const R = r.t * reach * 1.9, d = Math.hypot(p.x - r.x, p.y - r.y);
          const band = Math.max(0, 1 - Math.abs(d - R) / (reach * 0.5)) * Math.max(0, 1 - r.t / 1.8);
          if (band > l) l = band;
        }
        p.target = l;
      }
      // when one lights up, its neighbors do too
      for (const [i, j] of pairs) {
        const a = dots[i], b = dots[j];
        if (a.target * 0.62 > b.target) b.target = a.target * 0.62;
        if (b.target * 0.62 > a.target) a.target = b.target * 0.62;
      }
      for (const p of dots) p.lit += (p.target - p.lit) * (reduceMotion ? 1 : 0.12);
      for (const h of hoods) { let m = 0; for (let i = h.start; i < h.end; i++) if (dots[i].lit > m) m = dots[i].lit; h.lit = m; }

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [i, j] of pairs) { ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); }
      ctx.strokeStyle = "rgba(23,25,28,0.075)"; ctx.stroke();
      for (const [i, j] of pairs) {
        const lit = Math.min(dots[i].lit, dots[j].lit);
        if (lit < 0.06) continue;
        ctx.strokeStyle = `rgba(${mix(INK, MAG, Math.min(1, lit * 1.4))},${0.85 * lit})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
      }
      ctx.beginPath();
      for (const p of dots) if (p.lit < 0.06) { ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); }
      ctx.fillStyle = "rgba(23,25,28,0.24)"; ctx.fill();
      for (const p of dots) {
        if (p.lit < 0.06) continue;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + p.lit * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${mix(INK, MAG, Math.min(1, p.lit * 1.3))},${0.28 + 0.72 * p.lit})`; ctx.fill();
      }
      const wide = W > 900;
      ctx.font = `500 ${wide ? 11 : 10}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = "middle";
      if ("letterSpacing" in ctx) ctx.letterSpacing = "1.2px";
      for (const h of hoods) {
        const showBase = wide || h.wgt >= 0.9;
        const base = reduceMotion ? (showBase ? 0.6 : 0) : (showBase ? 0.14 + 0.16 * h.wgt : 0);
        const a = Math.min(1, base + h.lit);
        if (a < 0.03) continue;
        let x = h.cx, y = h.cy;
        const tw = ctx.measureText(h.name).width;
        if (h.side === "n") { y = h.cy - h.r - 9; ctx.textAlign = "center"; x = Math.min(Math.max(x, tw / 2 + 6), W - tw / 2 - 6); }
        else if (h.side === "s") { y = h.cy + h.r + 9; ctx.textAlign = "center"; x = Math.min(Math.max(x, tw / 2 + 6), W - tw / 2 - 6); }
        else if (h.side === "e") { x = Math.min(h.cx + h.r + 7, W - tw - 6); ctx.textAlign = "left"; }
        else { x = Math.max(h.cx - h.r - 7, tw + 6); ctx.textAlign = "right"; }
        y = Math.min(Math.max(y, 10), H - 10);
        ctx.lineWidth = 4; ctx.strokeStyle = `rgba(244,245,241,${0.95 * a})`; ctx.strokeText(h.name, x, y);
        ctx.fillStyle = `rgba(${mix([61, 66, 72], [158, 23, 73], Math.min(1, h.lit * 1.4))},${a})`; ctx.fillText(h.name, x, y);
      }
      if (running && !reduceMotion) raf = requestAnimationFrame(draw);
    }

    function start() { if (running) return; running = true; last = performance.now(); if (reduceMotion) { draw(performance.now()); running = false; } else raf = requestAnimationFrame(draw); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    layout(); start();
    let resizeTimer;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { layout(); if (reduceMotion) draw(performance.now()); }, 120); });
    const hero = canvas.closest(".hero3") || canvas;
    const track = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; if (reduceMotion) draw(performance.now()); };
    hero.addEventListener("pointermove", track);
    hero.addEventListener("pointerdown", track);
    hero.addEventListener("pointerleave", () => { mouse.x = -1e4; mouse.y = -1e4; if (reduceMotion) draw(performance.now()); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())), { threshold: 0.05 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  }

  /* ---------- values: posters flip ---------- */
  $$(".poster").forEach((poster) => {
    poster.addEventListener("click", () => {
      const flipped = poster.classList.toggle("is-flipped");
      poster.setAttribute("aria-pressed", String(flipped));
      poster.querySelector(".poster__back").setAttribute("aria-hidden", String(!flipped));
    });
  });

  /* ---------- reveal on scroll (rules draw in, marks animate) + count-up ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target) || reduceMotion) { el.textContent = target; return; }
    const dur = 1100, start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * easeOut(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.hasAttribute("data-reveal")) setTimeout(() => el.classList.add("is-in"), Number(el.dataset.revealDelay) || 0);
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    $$("[data-reveal]").forEach((el, i) => { el.dataset.revealDelay = String((i % 6) * 110); io.observe(el); });
    $$("[data-count]").forEach((el) => io.observe(el));
  } else {
    $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- where does your data go? ---------- */
  const dp = $("#datapath");
  if (dp) {
    const tabs = $$("[role=tab]", dp);
    const captions = { typical: $("[data-caption-typical]", dp), ours: $("[data-caption-ours]", dp) };
    const svg = $("svg", dp);
    const setMode = (mode) => {
      dp.dataset.mode = mode;
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === mode)));
      Object.keys(captions).forEach((k) => { if (captions[k]) captions[k].hidden = k !== mode; });
    };
    tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));
    dp.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      setMode(next.dataset.mode); next.focus();
    });
    if (reduceMotion && svg && svg.pauseAnimations) svg.pauseAnimations();
  }

  /* ---------- sliders: projects (manual) and quotes (auto-advancing) ---------- */
  $$("[data-slider]").forEach((slider) => {
    const track = $("[data-slider-track]", slider);
    const slides = track ? $$(".slider__slide", track) : [];
    if (!slides.length) return;
    const prev = $("[data-slider-prev]", slider), next = $("[data-slider-next]", slider);
    const count = $("[data-slider-count]", slider), toggle = $("[data-slider-toggle]", slider), bar = $("[data-slider-progress]", slider);
    const n = slides.length;
    const interval = parseInt(slider.dataset.autoplay, 10) || 0;
    const loops = interval > 0;

    const metrics = () => {
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.columnGap) || 0;
      const inner = track.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const step = slides[0].getBoundingClientRect().width + gap;
      const visible = Math.max(1, Math.min(n, Math.round((inner + gap) / step)));
      return { step, visible, max: Math.max(0, n - visible) };
    };
    const current = () => { const m = metrics(); return Math.min(m.max, Math.max(0, Math.round(track.scrollLeft / m.step))); };
    const go = (i) => {
      const m = metrics();
      const target = loops ? (i > m.max ? 0 : i < 0 ? m.max : i) : Math.min(m.max, Math.max(0, i));
      track.scrollTo({ left: target * m.step, behavior: reduceMotion ? "auto" : "smooth" });
    };
    const meter = $("[data-slider-meter]", slider);
    const update = () => {
      const m = metrics(), i = current();
      if (meter) {
        const span = track.scrollWidth - track.clientWidth;
        const share = Math.min(1, m.visible / n);
        meter.style.width = `${share * 100}%`;
        meter.style.left = `${(span > 0 ? track.scrollLeft / span : 0) * (1 - share) * 100}%`;
      }
      if (count) count.textContent = m.visible > 1 ? `${i + 1}–${Math.min(i + m.visible, n)} of ${n}` : `${i + 1} of ${n}`;
      if (!loops) {
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= m.max;
      }
      slider.classList.toggle("is-static", m.max === 0);
    };
    let ticking = false;
    track.addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }, { passive: true });
    window.addEventListener("resize", update);
    update();

    // auto-advance (quotes): pauses for hover, keyboard focus, hidden tabs, off-screen, and reduced motion
    let playing = loops && !reduceMotion, hovered = false, focused = false, onScreen = true, elapsed = 0, last = 0;
    const setPlaying = (on) => {
      playing = on;
      slider.classList.toggle("is-paused", !on);
      if (toggle) toggle.setAttribute("aria-label", on ? "Pause the quotes" : "Play the quotes");
    };
    const restart = () => { elapsed = 0; if (bar) bar.style.transform = "scaleX(0)"; };
    if (prev) prev.addEventListener("click", () => { restart(); go(current() - 1); });
    if (next) next.addEventListener("click", () => { restart(); go(current() + 1); });
    if (!loops) return;
    setPlaying(playing);
    if (toggle) toggle.addEventListener("click", () => { setPlaying(!playing); });
    slider.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = true; });
    slider.addEventListener("pointerleave", () => { hovered = false; });
    slider.addEventListener("focusin", () => { focused = true; });
    slider.addEventListener("focusout", (e) => { if (!slider.contains(e.relatedTarget)) focused = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }, { threshold: 0.25 }).observe(slider);
    const frame = (t) => {
      const dt = last ? Math.min(1000, t - last) : 0; last = t;
      if (playing && !hovered && !focused && onScreen && !document.hidden) {
        elapsed += dt;
        if (elapsed >= interval) { elapsed = 0; go(current() + 1); }
      }
      if (bar) bar.style.transform = `scaleX(${Math.min(1, elapsed / interval)})`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  /* ---------- values drawer (home): a preview row that opens into the posters ---------- */
  $$("[data-values-block]").forEach((block) => {
    const drawer = $("[data-values-drawer]", block);
    if (!drawer) return;
    const sync = () => block.classList.toggle("is-open", drawer.open);
    drawer.addEventListener("toggle", sync);
    sync();
    $$("[data-open-value]", block).forEach((btn) => {
      btn.addEventListener("click", () => {
        drawer.open = true;
        sync();
        const slot = $$(".poster-slot", drawer)[Number(btn.dataset.openValue)];
        if (!slot) return;
        requestAnimationFrame(() => {
          slot.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
          const poster = slot.querySelector(".poster");
          if (poster) poster.focus({ preventScroll: true });
          slot.classList.add("is-called");
          setTimeout(() => slot.classList.remove("is-called"), 1600);
        });
      });
    });
  });

  /* ---------- list filters (lab-note topics, project kinds) ---------- */
  const filter = $("[data-filter]");
  const list = $("[data-filter-list]");
  if (filter && list) {
    const empty = $("[data-filter-empty]");
    const apply = (value) => {
      $$("[data-value], [data-topic]", filter).forEach((b) => b.classList.toggle("chip--active", (b.dataset.value ?? b.dataset.topic) === value));
      let shown = 0;
      $$("[data-values], [data-topics]", list).forEach((row) => {
        const vals = (row.dataset.values ?? row.dataset.topics ?? "").split("|");
        const ok = !value || vals.includes(value);
        row.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    filter.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-value], [data-topic]");
      if (!btn) return;
      apply(btn.dataset.value ?? btn.dataset.topic);
    });
    try {
      const wanted = new URLSearchParams(location.search).get(filter.dataset.filter || "topic");
      if (wanted) apply(wanted);
    } catch (err) { /* no query support here */ }
  }

  /* ---------- keep --header-h in step with the sticky masthead: banner + header (anchor offsets, sticky columns) ---------- */
  const siteHeader = $(".masthead") || $(".site-header");
  const syncHeader = () => {
    if (siteHeader) document.documentElement.style.setProperty("--header-h", `${Math.round(siteHeader.getBoundingClientRect().height)}px`);
  };
  syncHeader();
  window.addEventListener("resize", syncHeader);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeader);

  /* ---------- pages open at the top, or exactly at their #section; in-page anchors scroll smoothly ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const hashTarget = () => {
    if (!location.hash || location.hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (err) { return null; }
  };
  let visitorMoved = false;
  ["wheel", "touchmove", "keydown", "mousedown"].forEach((type) => window.addEventListener(type, () => { visitorMoved = true; }, { passive: true, once: true }));
  const openAtTop = () => {
    const target = hashTarget();
    if (target) {
      const land = () => { if (visitorMoved) return; syncHeader(); target.scrollIntoView({ block: "start", behavior: "auto" }); };
      land();
      // web fonts and late images reflow the page after the first jump, which used to strand visitors mid-page;
      // land again once they settle, unless the visitor has already started scrolling
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(land);
      if (document.readyState !== "complete") window.addEventListener("load", land, { once: true });
      return;
    }
    window.scrollTo(0, 0);
    if (window.top !== window) {
      try { document.getElementById("page-top").scrollIntoView({ block: "start", behavior: "instant" }); } catch (err) { /* framed host refused */ }
    }
  };
  openAtTop();
  window.addEventListener("pageshow", (e) => { if (e.persisted) openAtTop(); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.pathname !== location.pathname || url.origin !== location.origin || !url.hash) return;
    let target = null;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch (err) { /* malformed hash */ }
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    history.pushState(null, "", url.hash);
  });

  /* ---------- contact form: ?interest=training preselects what the visitor came for ---------- */
  const interest = $('select[name="interest"]');
  if (interest) {
    try {
      const want = new URLSearchParams(location.search).get("interest");
      const opt = want && Array.from(interest.options).find((o) => o.dataset.key === want);
      if (opt) interest.value = opt.value;
    } catch (err) { /* no query support here */ }
  }

  /* ---------- where visitors came from: ?src=, ?ref=, ?source= or ?utm_source= (first-party, this tab only) ---------- */
  let visitSource = "";
  try {
    const q = new URLSearchParams(location.search);
    visitSource = (q.get("src") || q.get("ref") || q.get("source") || q.get("utm_source") || "").trim().slice(0, 60);
    if (visitSource) sessionStorage.setItem("hg-source", visitSource);
    else visitSource = sessionStorage.getItem("hg-source") || "";
  } catch (err) { /* storage unavailable */ }
  $$("[data-source-field]").forEach((input) => { input.value = visitSource; });

  /* ---------- forms: post to the configured endpoint, or open a filled-in email draft ---------- */
  $$("form.form[data-mailto]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (form.getAttribute("action")) return;
      e.preventDefault();
      const lines = [];
      new FormData(form).forEach((value, name) => {
        if (name.startsWith("_") || !String(value).trim()) return;
        const field = form.querySelector(`[name="${name}"]`);
        const label = field && field.id ? form.querySelector(`label[for="${field.id}"]`) : null;
        lines.push(`${label ? label.textContent.trim() : name.charAt(0).toUpperCase() + name.slice(1)}: ${value}`);
      });
      const who = form.querySelector('[name="name"]');
      const subject = `${form.dataset.subject || "Website inquiry"}${who && who.value ? " from " + who.value : ""}`;
      location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setTimeout(() => { location.href = form.dataset.thanks; }, 800);
    });
  });

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const scope = btn.parentElement;
      const src = $("[data-copy-text]", scope) || $("[data-copy-text]", btn.closest(".kit__col, .callout") || document);
      const text = src ? src.textContent.trim() : "";
      const original = btn.textContent;
      try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
      catch (err) {
        const range = document.createRange(); range.selectNodeContents(src); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
        btn.textContent = "Selected";
      }
      setTimeout(() => { btn.textContent = original; }, 1600);
    });
  });
})();
