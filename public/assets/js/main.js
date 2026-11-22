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

  /* Konten berita/akademik dirender ulang saat data berubah (mis. dari tab admin) */
  document.addEventListener("contentrendered", function () {
    watchReveals(document);
  });

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
     4. Navigasi tab (Beranda, Profil, Akademik, ...)
     --------------------------------------------------------------------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  var panelIds = panels.map(function (panel) { return panel.id; });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link[href^='#']"));
  var navGroups = Array.prototype.slice.call(document.querySelectorAll(".nav__group"));
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__menu-link"));
  var hoverMenu = window.matchMedia("(hover: hover) and (min-width: 1081px)");

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

    menuLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    navGroups.forEach(function (group) {
      var toggle = group.querySelector(".nav__toggle");
      if (!toggle) return;
      toggle.classList.toggle("is-active", !!group.querySelector(".nav__menu-link.is-active"));
    });
  }

  /* Dropdown Akademik */
  function setMenuOpen(group, open) {
    var toggle = group.querySelector(".nav__toggle");
    var menu = group.querySelector(".nav__menu");
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  }

  function closeMenus(except) {
    navGroups.forEach(function (group) {
      if (group !== except) setMenuOpen(group, false);
    });
  }

  navGroups.forEach(function (group) {
    var toggle = group.querySelector(".nav__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      closeMenus(group);
      setMenuOpen(group, !open);
    });

    group.addEventListener("mouseenter", function () {
      if (!hoverMenu.matches) return;
      closeMenus(group);
      setMenuOpen(group, true);
    });

    group.addEventListener("mouseleave", function () {
      if (!hoverMenu.matches) return;
      setMenuOpen(group, false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav__group")) closeMenus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openToggle = document.querySelector('.nav__toggle[aria-expanded="true"]');
    if (!openToggle) return;
    closeMenus();
    openToggle.focus();
  });

  document.addEventListener("tabchange", function () {
    closeMenus();
  });

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
     5. Berita, prestasi & kegiatan (data dari api/posts.php)
     --------------------------------------------------------------------- */
  var newsGrid = document.querySelector("[data-news-grid]");
  var newsFilters = document.querySelector("[data-news-filters]");
  var newsEmpty = document.querySelector("[data-news-empty]");
  var newsMore = document.querySelector("[data-news-more]");
  var latestSection = document.querySelector("[data-latest-section]");
  var latestGrid = document.querySelector("[data-latest-grid]");

  function buildNewsCard(item) {
    var card = document.createElement("article");
    card.className = "news-card";

    var media = document.createElement("a");
    media.className = "news-card__media";
    media.href = item.url;
    media.tabIndex = -1;
    media.setAttribute("aria-hidden", "true");

    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = "";
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      var placeholder = document.createElement("span");
      placeholder.className = "news-card__placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.textContent = (item.category_label || "B").charAt(0);
      media.appendChild(placeholder);
    }

    var badge = document.createElement("span");
    badge.className = "news-card__badge badge--" + item.category;
    badge.textContent = item.category_label;
    media.appendChild(badge);

    var body = document.createElement("div");
    body.className = "news-card__body";

    var date = document.createElement("p");
    date.className = "news-card__date";
    var time = document.createElement("time");
    time.dateTime = item.date_iso;
    time.textContent = item.date;
    date.appendChild(time);

    var heading = document.createElement("h3");
    var titleLink = document.createElement("a");
    titleLink.href = item.url;
    titleLink.textContent = item.title;
    heading.appendChild(titleLink);

    var excerpt = document.createElement("p");
    excerpt.className = "news-card__excerpt";
    excerpt.textContent = item.excerpt;

    var link = document.createElement("a");
    link.className = "link";
    link.href = item.url;
    link.textContent = "Baca selengkapnya ";
    var arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    link.appendChild(arrow);

    body.appendChild(date);
    body.appendChild(heading);
    body.appendChild(excerpt);
    body.appendChild(link);

    card.appendChild(media);
    card.appendChild(body);

    return card;
  }

  function fillNewsGrid(grid, items) {
    grid.textContent = "";
    items.forEach(function (item) {
      grid.appendChild(buildNewsCard(item));
    });
  }

  function newsRequest(path) {
    return fetch(path, { headers: { Accept: "application/json" } }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }

  if (newsGrid) {
    var currentCategory = "";
    var requestId = 0;

    var emptyTitle = newsEmpty ? newsEmpty.querySelector("strong") : null;
    var defaultEmptyText = emptyTitle ? emptyTitle.textContent : "";

    var showNewsError = function (message) {
      newsGrid.hidden = true;
      if (newsEmpty) {
        newsEmpty.hidden = false;
        if (emptyTitle && message) emptyTitle.textContent = message;
      }
      if (newsMore) newsMore.hidden = false;
    };

    var loadNews = function (category) {
      var id = ++requestId;

      newsGrid.hidden = false;
      newsGrid.textContent = "";
      var loading = document.createElement("p");
      loading.className = "news-loading";
      loading.textContent = "Memuat berita…";
      newsGrid.appendChild(loading);
      if (newsEmpty) newsEmpty.hidden = true;
      if (newsMore) newsMore.hidden = true;

      newsRequest("/api/posts?limit=12" + (category ? "&kategori=" + encodeURIComponent(category) : ""))
        .then(function (data) {
          if (id !== requestId) return;

          var items = data.items || [];

          if (!items.length) {
            if (emptyTitle) {
              emptyTitle.textContent = category
                ? "Belum ada " + category + " yang dipublikasikan."
                : defaultEmptyText;
            }
            showNewsError("");
            return;
          }

          fillNewsGrid(newsGrid, items);
          newsGrid.hidden = false;
          if (newsEmpty) newsEmpty.hidden = true;
          if (newsMore) newsMore.hidden = false;
        })
        .catch(function () {
          if (id !== requestId) return;
          showNewsError("Berita belum dapat dimuat.");
        });
    };

    if (newsFilters) {
      newsFilters.addEventListener("click", function (event) {
        var button = event.target.closest("[data-category]");
        if (!button) return;

        var category = button.getAttribute("data-category") || "";
        if (category === currentCategory) return;
        currentCategory = category;

        Array.prototype.forEach.call(newsFilters.querySelectorAll("[data-category]"), function (item) {
          var active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });

        loadNews(category);
      });
    }

    loadNews("");
  }

  if (latestSection && latestGrid) {
    newsRequest("/api/posts?limit=3")
      .then(function (data) {
        var items = data.items || [];
        if (!items.length) return;

        fillNewsGrid(latestGrid, items);
        latestSection.hidden = false;

        var head = latestSection.querySelector(".reveal");
        if (head) head.classList.add("is-visible");
      })
      .catch(function () {
        /* Bagian kabar terbaru disembunyikan jika API belum tersedia. */
      });
  }

  /* ---------------------------------------------------------------------
     6. Sambutan kepala sekolah: buka/tutup teks
     --------------------------------------------------------------------- */
  var welcomeMore = document.querySelector("[data-welcome-more]");
  var welcomeText = welcomeMore
    ? document.getElementById(welcomeMore.getAttribute("aria-controls"))
    : null;

  if (welcomeMore && welcomeText) {
    welcomeMore.addEventListener("click", function () {
      var expanded = welcomeMore.getAttribute("aria-expanded") === "true";
      welcomeMore.setAttribute("aria-expanded", String(!expanded));
      welcomeText.classList.toggle("is-expanded", !expanded);
      var label = welcomeMore.querySelector("span");
      if (label) label.textContent = expanded ? "Baca Selengkapnya" : "Tutup";
    });
  }

  /* ---------------------------------------------------------------------
     7. Tahun berjalan di footer
     --------------------------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
