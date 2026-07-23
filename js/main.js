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
