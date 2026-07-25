/* Big Moose AI — shared interactions */
(function () {
  "use strict";

  /* Header background on scroll */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        mobileMenu.classList.remove("open");
      })
    );
  }

  /* Scroll reveal */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* Stagger children helper: [data-stagger] gives children incremental delays */
  document.querySelectorAll("[data-stagger]").forEach((wrap) => {
    Array.from(wrap.children).forEach((child, i) => {
      child.style.setProperty("--d", i * 0.09 + "s");
    });
  });

  /* Button label duplication for swipe-up hover */
  document.querySelectorAll(".btn .btn-label").forEach((label) => {
    if (!label.dataset.text) label.dataset.text = label.textContent.trim();
    if (!label.querySelector("i")) {
      const inner = document.createElement("i");
      inner.textContent = label.textContent.trim();
      label.textContent = "";
      label.appendChild(inner);
    }
  });

  /* Magnetic buttons */
  const magnets = document.querySelectorAll(".btn");
  magnets.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  /* Card spotlight follows cursor */
  document.querySelectorAll(".v-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* Hero word-by-word reveal */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span class="split-word"><span style="animation-delay:${0.08 * i}s">${w}</span></span>`
      )
      .join(" ");
  });

  /* Carousel: drag to scroll + arrows */
  document.querySelectorAll(".carousel-wrap").forEach((wrap) => {
    const track = wrap.querySelector(".carousel");
    const prev = wrap.querySelector("[data-prev]");
    const next = wrap.querySelector("[data-next]");
    if (!track) return;
    const step = () => {
      const card = track.querySelector(".c-card, .blog-card");
      return card ? card.getBoundingClientRect().width + 22 : 400;
    };
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener("pointerup", () => {
      isDown = false;
      track.classList.remove("dragging");
    });
  });

  /* Animated counters */
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const dur = 1600;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent =
            prefix + (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterIO.observe(el));

  /* Contact form (front-end only demo) */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form-success");
      if (ok) {
        ok.style.display = "block";
        form.reset();
        ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  /* Current year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

/* ===== Hero vertical carousel ===== */
(function () {
  const hc = document.querySelector(".hero-carousel");
  if (!hc) return;
  const track = hc.querySelector(".hc-track");
  const slides = Array.from(track.children);
  const dotsWrap = hc.querySelector(".hc-dots");
  const n = slides.length;
  let i = 0, timer = null;

  slides.forEach((_, k) => {
    const d = document.createElement("button");
    d.className = "hc-dot" + (k === 0 ? " active" : "");
    d.setAttribute("aria-label", "Go to slide " + (k + 1));
    d.addEventListener("click", () => { go(k); restart(); });
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function go(k) {
    i = (k + n) % n;
    track.style.transform = `translateY(-${i * 100}%)`;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 6500);
  }

  hc.querySelector("[data-hc-prev]").addEventListener("click", () => { go(i - 1); restart(); });
  hc.querySelector("[data-hc-next]").addEventListener("click", () => { go(i + 1); restart(); });
  hc.addEventListener("mouseenter", () => clearInterval(timer));
  hc.addEventListener("mouseleave", restart);

  /* touch swipe (vertical) */
  let y0 = null;
  hc.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  hc.addEventListener("touchend", (e) => {
    if (y0 === null) return;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dy) > 60) { go(i + (dy < 0 ? 1 : -1)); restart(); }
    y0 = null;
  }, { passive: true });

  restart();
})();

/* ===== Matrix rain + falling stars (stats section background) ===== */
(function () {
  const canvas = document.querySelector(".matrix-bg");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const COLORS = ["#00aeef", "#2e6bff", "#8b3dff", "#f01ed0"];
  const GLYPHS = "01+◆·10AI";
  const GAP = 30;
  let W = 0, H = 0, drops = [], stars = [], raf = null, last = 0;

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    if (r.width === W && r.height === H) return;
    W = canvas.width = Math.max(1, Math.floor(r.width));
    H = canvas.height = Math.max(1, Math.floor(r.height));
    const cols = Math.floor(W / GAP);
    drops = Array.from({ length: cols }, (_, i) => ({
      x: i * GAP + GAP / 2,
      y: Math.random() * H,
      speed: 0.5 + Math.random() * 1.1,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    ctx.fillStyle = "#0a0a0d";
    ctx.fillRect(0, 0, W, H);
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (t - last < 40) return; /* ~25fps is plenty for a subtle effect */
    last = t;

    /* fade previous frame toward the page background */
    ctx.fillStyle = "rgba(10, 10, 13, 0.16)";
    ctx.fillRect(0, 0, W, H);

    /* matrix glyph rain */
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    for (const d of drops) {
      const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = d.color;
      ctx.fillText(g, d.x, d.y);
      ctx.globalAlpha = 1;
      d.y += d.speed * 9;
      if (d.y > H + 20) {
        d.y = -10 - Math.random() * 60;
        d.speed = 0.5 + Math.random() * 1.1;
        d.color = COLORS[(Math.random() * COLORS.length) | 0];
      }
    }

    /* occasional falling star with a glowing tail */
    if (Math.random() < 0.05 && stars.length < 4) {
      stars.push({
        x: Math.random() * W,
        y: -30,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 3.2 + Math.random() * 2.4,
        len: 46 + Math.random() * 60,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      });
    }
    for (let s = stars.length - 1; s >= 0; s--) {
      const st = stars[s];
      const grad = ctx.createLinearGradient(st.x, st.y - st.len, st.x, st.y);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, st.color);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(st.x - st.vx * (st.len / st.vy), st.y - st.len);
      ctx.lineTo(st.x, st.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      st.x += st.vx;
      st.y += st.vy;
      if (st.y - st.len > H) stars.splice(s, 1);
    }
  }

  /* run only while the section is on screen */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          resize();
          if (!raf) raf = requestAnimationFrame(tick);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    },
    { rootMargin: "100px" }
  );
  io.observe(canvas.parentElement);
  window.addEventListener("resize", resize);
})();

/* ===== Mad-lib chips (contact) ===== */
(function () {
  document.querySelectorAll(".ml-chips").forEach((group) => {
    const field = group.dataset.field;
    const hidden = document.querySelector(`input[type="hidden"][name="${field}"]`);
    const multi = group.hasAttribute("data-multi");
    group.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (multi) {
          chip.classList.toggle("on");
        } else {
          group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === chip && !c.classList.contains("on")));
        }
        if (hidden) {
          hidden.value = [...group.querySelectorAll(".chip.on")].map((c) => c.textContent.trim()).join(", ");
        }
      });
    });
  });
})();

/* ===== Postcard lightbox (contact cities) ===== */
(function () {
  const box = document.querySelector("#postcard-box");
  if (!box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector("figcaption");
  const open = (src, city) => {
    img.src = src;
    img.alt = "Big Moose in " + city;
    cap.textContent = city;
    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".city[data-postcard]").forEach((c) => {
    c.addEventListener("click", () => open(c.dataset.postcard, c.dataset.city));
  });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
