/* ==========================================================================
   SMK Bintang Nusantara 2 — interaksi halaman
   Navigasi tab, slider hero, dan animasi saat digulir.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");

  /* ---------------------------------------------------------------------
     1. Tinggi header (dipakai untuk jarak konten & tinggi hero)
     --------------------------------------------------------------------- */
  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
  window.addEventListener("load", syncHeaderHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeaderHeight);
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------------------
     2. Animasi muncul saat digulir
     --------------------------------------------------------------------- */
  var revealObserver = null;

  if ("IntersectionObserver" in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  }

  function watchReveals(panel) {
    if (!panel) return;
    var items = panel.querySelectorAll(".reveal:not(.is-visible)");

    Array.prototype.forEach.call(items, function (item) {
      if (!revealObserver) {
        item.classList.add("is-visible");
        return;
      }
      // observe ulang supaya elemen di tab yang baru dibuka langsung dinilai
      revealObserver.unobserve(item);
      revealObserver.observe(item);
    });
  }

  watchReveals(document);

  /* ---------------------------------------------------------------------
     3. Slider foto hero
     --------------------------------------------------------------------- */
  var slider = document.querySelector("[data-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero__slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".dot"));
    var captionText = slider.querySelector("[data-caption-text]");
    var currentEl = slider.querySelector("[data-current]");
    var totalEl = slider.querySelector("[data-total]");
    var nextBtn = slider.querySelector("[data-next]");
    var prevBtn = slider.querySelector("[data-prev]");
    var autoplayDelay = parseInt(slider.getAttribute("data-autoplay"), 10) || 6000;
    var index = 0;
    var timer = null;
    var paused = false;

    if (totalEl) totalEl.textContent = String(slides.length).padStart(2, "0");

    function show(nextIndex, userAction) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
      });

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });

      if (captionText) {
        captionText.textContent = slides[index].getAttribute("data-caption") || "";
      }
      if (currentEl) {
        currentEl.textContent = String(index + 1).padStart(2, "0");
      }

      if (userAction) restart();
    }

    function stop() {
      window.clearInterval(timer);
    }

    function restart() {
      stop();
      if (reduceMotion || paused) return;
      timer = window.setInterval(function () {
        if (!slider.offsetParent) return;
        show(index + 1);
      }, autoplayDelay);
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1, true); });
    if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1, true); });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i, true); });
    });

    slider.addEventListener("mouseenter", function () {
      paused = true;
      stop();
    });

    slider.addEventListener("mouseleave", function () {
      paused = false;
      restart();
    });

    slider.addEventListener("focusin", function () {
      paused = true;
      stop();
    });

    slider.addEventListener("focusout", function () {
      paused = false;
      restart();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        restart();
      }
    });

    /* Hentikan slide saat tab lain dibuka, lanjutkan saat kembali ke Beranda */
    document.addEventListener("tabchange", function (event) {
      if (event.detail.id === "beranda") {
        paused = false;
        restart();
      } else {
        stop();
      }
    });

    /* Geser dengan sentuhan */
    var touchStartX = 0;
    var touchStartY = 0;

    slider.addEventListener("touchstart", function (event) {
      var touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    slider.addEventListener("touchend", function (event) {
      var touch = event.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        show(index + (dx < 0 ? 1 : -1), true);
      }
    }, { passive: true });

    show(0);
    restart();
  }

  /* ---------------------------------------------------------------------
     4. Navigasi tab (Beranda, Profil, Jurusan, ...)
     --------------------------------------------------------------------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  var panelIds = panels.map(function (panel) { return panel.id; });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));

  function activePanelId() {
    var id = (window.location.hash || "").replace(/^#/, "");
    return panelIds.indexOf(id) > -1 ? id : "beranda";
  }

  function markActiveNav(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function scrollToTop() {
    // "instant" mengabaikan scroll-behavior: smooth di CSS
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // ulangi setelah layout tab baru selesai, supaya scroll anchoring tidak
    // menyisakan posisi beberapa piksel
    window.requestAnimationFrame(function () {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }

  function showTab(id, options) {
    options = options || {};
    if (panelIds.indexOf(id) === -1) id = "beranda";

    var target = null;

    panels.forEach(function (panel) {
      panel.hidden = panel.id !== id;
      if (panel.id === id) target = panel;
    });

    markActiveNav(id);

    if (options.push && window.location.hash !== "#" + id) {
      window.history.pushState(null, "", "#" + id);
    }

    if (options.scroll) {
      scrollToTop();
    }

    if (target) {
      target.setAttribute("tabindex", "-1");
      if (options.focus) target.focus({ preventScroll: true });
      watchReveals(target);
    }

    document.dispatchEvent(new CustomEvent("tabchange", { detail: { id: id } }));
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute("href").slice(1);
    if (panelIds.indexOf(id) === -1) return;

    event.preventDefault();
    showTab(id, {
      push: true,
      scroll: true,
      focus: link.classList.contains("skip-link")
    });
  });

  window.addEventListener("popstate", function () {
    showTab(activePanelId(), { scroll: true });
  });

  showTab(activePanelId(), { scroll: false });

  /* ---------------------------------------------------------------------
     5. Tahun berjalan di footer
     --------------------------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
