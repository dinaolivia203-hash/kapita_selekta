/* ==========================================================================
   SMK Bintang Nusantara 2 — penyimpanan & render konten
   Data berita, kalender akademik, dan prestasi disimpan di localStorage
   supaya bisa dikelola lewat halaman admin tanpa server.
   ========================================================================== */
window.SchoolContent = (function () {
  "use strict";

  var STORAGE_KEY = "smkbn2:content:v1";
  var MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  var ICONS = {
    trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 5H5.5a2.5 2.5 0 0 0 0 5H8M16 5h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M12 13v4m-3 3h6m-5.5 0c0-1.7 1.1-2.6 2.5-2.6s2.5.9 2.5 2.6"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M20 4L8.5 15.5M20 20L8.5 8.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c3 2 4.5 5 4.5 8.5s-1.5 6.5-4.5 8.5c-3-2-4.5-5-4.5-8.5S9 5.5 12 3.5z"/><path d="M3.5 12h17"/></svg>'
  };

  var ICON_OPTIONS = [
    { value: "trophy", label: "Piala / kejuaraan" },
    { value: "scissors", label: "Tata busana" },
    { value: "globe", label: "Olahraga / umum" }
  ];

  var IMAGE_OPTIONS = [
    { src: "assets/img/kelas.jpg", label: "Belajar di ruang kelas" },
    { src: "assets/img/siswa.jpg", label: "Siswa kelas 10" },
    { src: "assets/img/jahit-1.jpg", label: "Praktik menjahit dengan guru" },
    { src: "assets/img/jahit-2.jpg", label: "Praktik menjahit" },
    { src: "assets/img/lapangan.jpg", label: "Kegiatan di lapangan" },
    { src: "assets/img/mengaji-1.jpg", label: "Mengaji bersama" },
    { src: "assets/img/mengaji-2.jpg", label: "Belajar Al-Qur'an" },
    { src: "assets/img/sosial.jpg", label: "Kegiatan sosial" },
    { src: "assets/img/koridor.jpg", label: "Koridor sekolah" },
    { src: "assets/img/acara-2.jpg", label: "Acara bersama" },
    { src: "assets/img/makan.jpg", label: "Makan bersama" },
    { src: "assets/img/sholat.jpg", label: "Salat berjamaah" }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function text(value, fallback) {
    if (value === null || value === undefined) return fallback || "";
    return String(value).trim();
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function esc(value) {
    return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function safeImage(value) {
    var src = text(value);
    if (/^assets\/img\/[A-Za-z0-9._-]+$/.test(src)) return src;
    if (/^https:\/\/[^\s"'<>]+$/i.test(src)) return src;
    return "assets/img/siswa.jpg";
  }

  function formatDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
    if (!match) return text(value);
    var month = parseInt(match[2], 10);
    if (month < 1 || month > 12) return text(value);
    return parseInt(match[3], 10) + " " + MONTHS[month - 1] + " " + match[1];
  }

  function normalizeNews(item) {
    return {
      id: text(item.id) || uid("news"),
      date: /^\d{4}-\d{2}-\d{2}$/.test(text(item.date)) ? text(item.date) : "",
      tag: text(item.tag, "Berita"),
      title: text(item.title),
      text: text(item.text),
      image: safeImage(item.image)
    };
  }

  function normalizeCalendar(item) {
    return {
      id: text(item.id) || uid("cal"),
      day: text(item.day),
      month: text(item.month),
      title: text(item.title),
      text: text(item.text),
      holiday: item.holiday === true || item.holiday === "true"
    };
  }

  function normalizeAchievement(item) {
    var icon = text(item.icon);
    return {
      id: text(item.id) || uid("ach"),
      level: text(item.level, "Prestasi"),
      title: text(item.title),
      text: text(item.text),
      year: text(item.year),
      icon: ICONS[icon] ? icon : "trophy"
    };
  }

  function normalizeList(list, normalizer) {
    if (!Array.isArray(list)) return null;
    var result = [];
    list.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var normalized = normalizer(item);
      if (!normalized.title) return;
      result.push(normalized);
    });
    return result;
  }

  function defaults() {
    return clone(window.SCHOOL_CONTENT_DEFAULTS || { news: [], calendar: [], achievements: [] });
  }

  function normalize(raw) {
    var data = defaults();

    if (raw && typeof raw === "object") {
      ["news", "calendar", "achievements"].forEach(function (key) {
        var normalizer = key === "news" ? normalizeNews : key === "calendar" ? normalizeCalendar : normalizeAchievement;
        var list = normalizeList(raw[key], normalizer);
        if (list) data[key] = list;
      });
    }

    data.version = 1;
    return data;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      return normalize(JSON.parse(raw));
    } catch (error) {
      return defaults();
    }
  }

  function save(data) {
    var normalized = normalize(data);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* abaikan */
    }
    return defaults();
  }

  function emptyNote(message, tagName) {
    var note = document.createElement(tagName || "p");
    note.className = "content-empty";
    note.textContent = message;
    return note;
  }

  function renderNews(items) {
    var box = document.querySelector('[data-content="news"]');
    if (!box) return;

    box.innerHTML = "";

    if (!items.length) {
      box.appendChild(emptyNote("Belum ada berita sekolah. Tambahkan melalui halaman admin."));
      return;
    }

    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "news__card reveal";
      card.innerHTML =
        '<div class="news__media">' +
          '<img src="' + esc(safeImage(item.image)) + '" alt="' + esc(item.title) + '" loading="lazy">' +
          (item.tag ? '<span class="news__tag">' + esc(item.tag) + "</span>" : "") +
        "</div>" +
        '<div class="news__body">' +
          '<p class="news__date">' + esc(formatDate(item.date)) + "</p>" +
          "<h3>" + esc(item.title) + "</h3>" +
          "<p>" + esc(item.text) + "</p>" +
        "</div>";
      box.appendChild(card);
    });
  }

  function renderCalendar(items) {
    var box = document.querySelector('[data-content="calendar"]');
    if (!box) return;

    box.innerHTML = "";

    if (!items.length) {
      var empty = emptyNote("Belum ada agenda akademik. Tambahkan melalui halaman admin.", "li");
      empty.setAttribute("role", "listitem");
      box.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      var row = document.createElement("li");
      row.className = "calendar__item reveal" + (item.holiday ? " calendar__item--holiday" : "");
      row.innerHTML =
        '<span class="calendar__date">' +
          "<strong>" + esc(item.day || "—") + "</strong>" +
          "<span>" + esc(item.month) + "</span>" +
        "</span>" +
        '<div class="calendar__body">' +
          "<h3>" + esc(item.title) + "</h3>" +
          "<p>" + esc(item.text) + "</p>" +
        "</div>";
      box.appendChild(row);
    });
  }

  function renderAchievements(items) {
    var box = document.querySelector('[data-content="achievements"]');
    if (!box) return;

    box.innerHTML = "";

    if (!items.length) {
      box.appendChild(emptyNote("Belum ada prestasi yang dicatat. Tambahkan melalui halaman admin."));
      return;
    }

    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "achievement reveal";
      card.innerHTML =
        '<span class="achievement__icon">' + (ICONS[item.icon] || ICONS.trophy) + "</span>" +
        '<p class="achievement__level">' + esc(item.level) + "</p>" +
        "<h3>" + esc(item.title) + "</h3>" +
        "<p>" + esc(item.text) + "</p>" +
        (item.year ? '<span class="achievement__year">' + esc(item.year) + "</span>" : "");
      box.appendChild(card);
    });
  }

  function renderMain() {
    var data = load();
    renderNews(data.news);
    renderCalendar(data.calendar);
    renderAchievements(data.achievements);
  }

  if (document.querySelector("[data-content]")) {
    renderMain();
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) renderMain();
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    ICONS: ICONS,
    ICON_OPTIONS: ICON_OPTIONS,
    IMAGE_OPTIONS: IMAGE_OPTIONS,
    load: load,
    save: save,
    reset: reset,
    normalize: normalize,
    renderMain: renderMain,
    formatDate: formatDate,
    safeImage: safeImage,
    esc: esc,
    uid: uid
  };
})();
