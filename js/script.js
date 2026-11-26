/* ==========================================================================
   Kulver & Preeti — script.js
   Vanilla JS: nav, mobile menu, reveal, counters, compare sliders,
   filters, lightbox, testimonials, cursor, parallax, tilt, form, back-to-top
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------
     1. Sticky navbar
  --------------------------------------------------------------- */
  const nav = $(".kv-nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------------------------------------------------------------
     2. Mobile fullscreen menu
  --------------------------------------------------------------- */
  const burger = $(".kv-burger");
  const mobileMenu = $(".kv-mobile-menu");
  const mobileClose = $(".kv-mobile-menu__close");

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    document.body.style.overflow = "hidden";
    mobileMenu.setAttribute("aria-hidden", "false");
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
    mobileMenu.setAttribute("aria-hidden", "true");
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (mobileClose) mobileClose.addEventListener("click", closeMenu);
  $$(".kv-mobile-menu__link").forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------------------------------------------------------
     3. Scroll reveal (IntersectionObserver)
  --------------------------------------------------------------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------
     4. Animated counters
  --------------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animateCounter(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => cio.observe(c));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------------------------------------------------------
     5. Skill bars (about page)
  --------------------------------------------------------------- */
  const skillFills = $$(".kv-skill__fill");
  if (skillFills.length && "IntersectionObserver" in window) {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.width = (e.target.dataset.level || "0") + "%";
            sio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillFills.forEach((f) => sio.observe(f));
  } else {
    skillFills.forEach((f) => (f.style.width = (f.dataset.level || "0") + "%"));
  }

  /* ---------------------------------------------------------------
     6. Before/After comparison sliders
  --------------------------------------------------------------- */
  function initCompare(root) {
    const after = $(".kv-compare__after", root);
    const divider = $(".kv-compare__divider", root);
    const handle = $(".kv-compare__handle", root);
    const range = $(".kv-compare__range", root);
    if (!after || !divider || !handle) return;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      divider.style.left = pct + "%";
      handle.style.left = pct + "%";
      if (range) range.value = pct;
    }
    setPos(50);

    let dragging = false;
    function moveFromClientX(clientX) {
      const rect = root.getBoundingClientRect();
      setPos(((clientX - rect.left) / rect.width) * 100);
    }
    function start(e) {
      dragging = true;
      root.classList.add("is-dragging");
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      moveFromClientX(x);
    }
    function move(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      moveFromClientX(x);
    }
    function end() {
      dragging = false;
      root.classList.remove("is-dragging");
    }
    handle.addEventListener("mousedown", start);
    root.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseup", end);
    handle.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end);

    // keyboard accessibility via range input
    if (range) {
      range.addEventListener("input", () => setPos(parseFloat(range.value)));
    }
  }
  $$(".kv-compare").forEach(initCompare);

  /* ---------------------------------------------------------------
     7. Services tabs
  --------------------------------------------------------------- */
  $$(".kv-services__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      $$(".kv-services__tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      $$(".kv-services__panel").forEach((p) =>
        p.classList.toggle("is-active", p.dataset.panel === target)
      );
    });
  });

  /* ---------------------------------------------------------------
     8. Portfolio filtering
  --------------------------------------------------------------- */
  const filterBtns = $$(".kv-filter");
  const galleryItems = $$("[data-cats]");
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
        galleryItems.forEach((item) => {
          const cats = (item.dataset.cats || "").split(" ");
          const show = filter === "all" || cats.includes(filter);
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------------------------------------------------------------
     9. Lightbox
  --------------------------------------------------------------- */
  const lightbox = $(".kv-lightbox");
  const lightboxImg = $(".kv-lightbox__img");
  const lightboxCaption = $(".kv-lightbox__caption");
  const lightboxClose = $(".kv-lightbox__close");

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || "Project preview";
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  $$("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", () => openLightbox(el.dataset.lightbox, el.dataset.caption));
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox)
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------------------------------------------------------------
     10. Testimonials carousel
  --------------------------------------------------------------- */
  const track = $(".kv-testi-track");
  if (track) {
    const cards = $$(".kv-testi-card", track);
    const prevBtn = $("[data-testi-prev]");
    const nextBtn = $("[data-testi-next]");
    let index = 0;

    function perView() {
      if (window.innerWidth <= 560) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }
    function update() {
      const pv = perView();
      const maxIndex = Math.max(0, cards.length - pv);
      if (index > maxIndex) index = maxIndex;
      const card = cards[0];
      const gap = 22;
      const step = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
    }
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        const pv = perView();
        const maxIndex = Math.max(0, cards.length - pv);
        index = index >= maxIndex ? 0 : index + 1;
        update();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        const pv = perView();
        const maxIndex = Math.max(0, cards.length - pv);
        index = index <= 0 ? maxIndex : index - 1;
        update();
      });
    window.addEventListener("resize", update);
    update();

    // auto-advance
    if (!prefersReduced) {
      let timer = setInterval(() => nextBtn && nextBtn.click(), 6000);
      track.addEventListener("mouseenter", () => clearInterval(timer));
      track.addEventListener("mouseleave", () => {
        timer = setInterval(() => nextBtn && nextBtn.click(), 6000);
      });
    }
  }

  /* ---------------------------------------------------------------
     11. Custom cursor
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "kv-cursor-dot";
    ring.className = "kv-cursor-ring";
    document.body.append(dot, ring);

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    const hoverTargets = "a, button, .kv-service-card, .kv-tile, .kv-mockup, .kv-compare__handle, .kv-counter-card, [data-lightbox]";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.add("is-active");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.remove("is-active");
    });
  }

  /* ---------------------------------------------------------------
     12. Parallax (hero + float elements) — desktop only
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    const parallaxEls = $$("[data-parallax]");
    const hero = $(".kv-hero");
    if (hero && parallaxEls.length) {
      hero.addEventListener("mousemove", (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        parallaxEls.forEach((el) => {
          const depth = parseFloat(el.dataset.parallax) || 12;
          el.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
        });
      });
      hero.addEventListener("mouseleave", () => {
        parallaxEls.forEach((el) => (el.style.transform = "translate(0,0)"));
      });
    }

    // scroll parallax
    const scrollParallax = $$("[data-parallax-y]");
    if (scrollParallax.length) {
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY;
          scrollParallax.forEach((el) => {
            const speed = parseFloat(el.dataset.parallaxY) || 0.15;
            el.style.transform = `translateY(${y * speed * -0.1}px)`;
          });
        },
        { passive: true }
      );
    }
  }

  /* ---------------------------------------------------------------
     13. 3D card tilt
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotX = (0.5 - py) * 10;
        const rotY = (px - 0.5) * 10;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------
     14. Magnetic buttons
  --------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------
     15. Contact form validation
  --------------------------------------------------------------- */
  const form = $("#kvContactForm");
  if (form) {
    const status = $(".kv-form__status", form);

    function setError(field, hasError) {
      const wrap = field.closest(".kv-field");
      if (wrap) wrap.classList.toggle("is-invalid", hasError);
    }
    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      const name = form.querySelector("[name='fullname']");
      const email = form.querySelector("[name='email']");
      const service = form.querySelector("[name='service']");
      const message = form.querySelector("[name='message']");

      [name, email, service, message].forEach((f) => {
        if (!f) return;
        const empty = !f.value.trim();
        const bad = f === email ? !validEmail(f.value.trim()) : empty;
        setError(f, bad);
        if (bad) ok = false;
      });

      if (!status) return;
      status.className = "kv-form__status";
      if (!ok) {
        status.classList.add("is-error");
        status.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Please complete the highlighted fields correctly.';
        status.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const submitBtn = form.querySelector("[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      status.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending your message...';
      status.scrollIntoView({ behavior: "smooth", block: "center" });

      const payload = { _subject: "New enquiry from K&V Editing website", _template: "table" };
      new FormData(form).forEach((v, k) => (payload[k] = v));

      fetch("https://formsubmit.co/ajax/kvikrant543@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => {
          if (!r.ok) throw new Error("send failed");
          status.classList.add("is-success");
          status.innerHTML = '<i class="bi bi-check-circle-fill"></i> Thank you — your message is on its way. We\'ll reply within one business day.';
          form.reset();
        })
        .catch(() => {
          status.classList.add("is-error");
          status.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Sorry — the message could not be sent. Please email us directly at kvikrant543@gmail.com.';
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
          status.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    // clear error on input
    form.querySelectorAll(".kv-input, .kv-select, .kv-textarea").forEach((f) => {
      f.addEventListener("input", () => setError(f, false));
    });
  }

  /* ---------------------------------------------------------------
     16. Back to top
  --------------------------------------------------------------- */
  const topBtn = $(".kv-top");
  if (topBtn) {
    window.addEventListener(
      "scroll",
      () => topBtn.classList.toggle("is-visible", window.scrollY > 600),
      { passive: true }
    );
    topBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---------------------------------------------------------------
     17. Smooth in-page anchor scroll
  --------------------------------------------------------------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ---------------------------------------------------------------
     18. Footer year
  --------------------------------------------------------------- */
  const year = $("#kvYear");
  if (year) year.textContent = new Date().getFullYear();
})();
