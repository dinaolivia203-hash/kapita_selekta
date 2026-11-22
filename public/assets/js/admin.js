/* ==========================================================================
   SMK Bintang Nusantara 2 — logika panel admin
   Mengelola konten berita, kalender akademik, dan prestasi di localStorage.
   ========================================================================== */
(function () {
  "use strict";

  var store = window.SchoolContent;
  if (!store) return;

  var DEFAULT_PASSWORD = "admin123";
  var PASS_KEY = "smkbn2:admin-pass";
  var SESSION_KEY = "smkbn2:admin-session";

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  /* ---------------------------------------------------------------------
     1. Pengunci sederhana (bukan keamanan server)
     --------------------------------------------------------------------- */
  function hashPassword(value) {
    var str = String(value || "");
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return "p" + hash.toString(16);
  }

  function savedPassword() {
    try {
      return window.localStorage.getItem(PASS_KEY) || hashPassword(DEFAULT_PASSWORD);
    } catch (error) {
      return hashPassword(DEFAULT_PASSWORD);
    }
  }

  function hasSession() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function startSession() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      /* abaikan */
    }
  }

  function endSession() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      /* abaikan */
    }
  }

  var gate = $("#adminGate");
  var app = $("#adminApp");
  var loginForm = $("#loginForm");
  var loginPassword = $("#loginPassword");
  var loginError = $("#loginError");

  function showApp() {
    gate.hidden = true;
    app.hidden = false;
    renderAll();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (hashPassword(loginPassword.value) === savedPassword()) {
        startSession();
        loginError.hidden = true;
        loginPassword.value = "";
        showApp();
      } else {
        loginError.hidden = false;
        loginPassword.select();
      }
    });
  }

  var logoutBtn = $("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      endSession();
      window.location.reload();
    });
  }

  /* ---------------------------------------------------------------------
     2. Data & daftar konten
     --------------------------------------------------------------------- */
  var content = store.load();
  var listBoxes = $$("[data-list]");

  function findIndexById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return i;
    }
    return -1;
  }

  function actionsHTML(id) {
    return '<div class="admin-item__actions">' +
      '<button class="admin-mini" type="button" data-action="edit" data-id="' + store.esc(id) + '">Edit</button>' +
      '<button class="admin-mini admin-mini--danger" type="button" data-action="delete" data-id="' + store.esc(id) + '">Hapus</button>' +
      "</div>";
  }

  function newsHTML(item) {
    return '<article class="admin-item">' +
      '<img class="admin-item__thumb" src="' + store.esc(store.safeImage(item.image)) + '" alt="" loading="lazy">' +
      '<div class="admin-item__body">' +
        '<p class="admin-item__meta">' + store.esc(store.formatDate(item.date)) + (item.tag ? " · " + store.esc(item.tag) : "") + "</p>" +
        "<h3>" + store.esc(item.title) + "</h3>" +
        (item.text ? "<p>" + store.esc(item.text) + "</p>" : "") +
        actionsHTML(item.id) +
      "</div>" +
    "</article>";
  }

  function calendarHTML(item) {
    return '<article class="admin-item">' +
      '<span class="admin-item__badge"><strong>' + store.esc(item.day || "—") + "</strong><span>" + store.esc(item.month) + "</span></span>" +
      '<div class="admin-item__body">' +
        '<p class="admin-item__meta">' + (item.holiday ? "Hari libur" : "Agenda akademik") + "</p>" +
        "<h3>" + store.esc(item.title) + "</h3>" +
        (item.text ? "<p>" + store.esc(item.text) + "</p>" : "") +
        actionsHTML(item.id) +
      "</div>" +
    "</article>";
  }

  function achievementHTML(item) {
    var icon = store.ICONS[item.icon] || store.ICONS.trophy;
    return '<article class="admin-item">' +
      '<span class="admin-item__badge admin-item__badge--icon">' + icon + "</span>" +
      '<div class="admin-item__body">' +
        '<p class="admin-item__meta">' + store.esc(item.level) + (item.year ? " · " + store.esc(item.year) : "") + "</p>" +
        "<h3>" + store.esc(item.title) + "</h3>" +
        (item.text ? "<p>" + store.esc(item.text) + "</p>" : "") +
        actionsHTML(item.id) +
      "</div>" +
    "</article>";
  }

  var itemRenderers = {
    news: newsHTML,
    calendar: calendarHTML,
    achievements: achievementHTML
  };

  function renderList(key) {
    var box = $('[data-list="' + key + '"]');
    if (!box) return;

    var items = content[key] || [];
    box.innerHTML = "";

    if (!items.length) {
      var empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "Belum ada " + (key === "news" ? "berita" : key === "calendar" ? "agenda" : "prestasi") + ". Tambahkan melalui formulir.";
      box.appendChild(empty);
      return;
    }

    box.innerHTML = items.map(itemRenderers[key]).join("");
  }

  function renderCounts() {
    $$("[data-count]").forEach(function (el) {
      var key = el.getAttribute("data-count");
      el.textContent = String((content[key] || []).length);
    });
  }

  function renderAll() {
    renderCounts();
    Object.keys(itemRenderers).forEach(renderList);
  }

  function saveOrWarn() {
    try {
      content = store.save(content);
      return true;
    } catch (error) {
      window.alert("Data tidak bisa disimpan di browser ini. Penyimpanan penuh atau diblokir. Coba ekspor data terlebih dahulu.");
      return false;
    }
  }

  /* ---------------------------------------------------------------------
     3. Tab panel
     --------------------------------------------------------------------- */
  var tabs = $$("[data-tab]");

  function showPanel(name) {
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    $$(".admin-panel").forEach(function (panel) {
      panel.hidden = panel.id !== "panel-" + name;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showPanel(tab.getAttribute("data-tab"));
    });
  });

  /* ---------------------------------------------------------------------
     4. Formulir tambah/edit
     --------------------------------------------------------------------- */
  var formLabels = {
    news: { add: "Tambah berita", edit: "Edit berita", save: "Simpan berita", update: "Perbarui berita" },
    calendar: { add: "Tambah agenda", edit: "Edit agenda", save: "Simpan agenda", update: "Perbarui agenda" },
    achievements: { add: "Tambah prestasi", edit: "Edit prestasi", save: "Simpan prestasi", update: "Perbarui prestasi" }
  };

  function fieldValue(fd, name) {
    var value = fd.get(name);
    return value === null ? "" : String(value).trim();
  }

  function buildItem(key, id, fd) {
    if (key === "news") {
      return {
        id: id || store.uid("news"),
        date: fieldValue(fd, "date"),
        tag: fieldValue(fd, "tag") || "Berita",
        title: fieldValue(fd, "title"),
        text: fieldValue(fd, "text"),
        image: fieldValue(fd, "image")
      };
    }

    if (key === "calendar") {
      return {
        id: id || store.uid("cal"),
        day: fieldValue(fd, "day"),
        month: fieldValue(fd, "month"),
        title: fieldValue(fd, "title"),
        text: fieldValue(fd, "text"),
        holiday: fd.get("holiday") === "on"
      };
    }

    return {
      id: id || store.uid("ach"),
      level: fieldValue(fd, "level"),
      title: fieldValue(fd, "title"),
      text: fieldValue(fd, "text"),
      year: fieldValue(fd, "year"),
      icon: fieldValue(fd, "icon") || "trophy"
    };
  }

  function resetForm(form) {
    var key = form.getAttribute("data-form");
    var labels = formLabels[key];

    form.reset();
    var idInput = form.elements.namedItem("id");
    if (idInput) idInput.value = "";

    var titleEl = form.querySelector("[data-form-title]");
    var submitEl = form.querySelector("[data-submit-label]");
    var cancel = form.querySelector("[data-cancel]");

    if (titleEl) titleEl.textContent = labels.add;
    if (submitEl) submitEl.textContent = labels.save;
    if (cancel) cancel.hidden = true;
  }

  function resetAllForms() {
    $$(".admin-form").forEach(resetForm);
  }

  function startEdit(key, id) {
    var form = $('[data-form="' + key + '"]');
    if (!form) return;

    var index = findIndexById(content[key] || [], id);
    if (index === -1) return;

    var item = content[key][index];
    var labels = formLabels[key];

    Object.keys(item).forEach(function (field) {
      var input = form.elements.namedItem(field);
      if (!input) return;
      if (input.type === "checkbox") {
        input.checked = item[field] === true;
      } else {
        input.value = item[field] === null || item[field] === undefined ? "" : item[field];
      }
    });

    var titleEl = form.querySelector("[data-form-title]");
    var submitEl = form.querySelector("[data-submit-label]");
    var cancel = form.querySelector("[data-cancel]");

    if (titleEl) titleEl.textContent = labels.edit;
    if (submitEl) submitEl.textContent = labels.update;
    if (cancel) cancel.hidden = false;

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    var titleInput = form.elements.namedItem("title");
    if (titleInput) window.setTimeout(function () { titleInput.focus({ preventScroll: true }); }, 320);
  }

  $$(".admin-form").forEach(function (form) {
    var key = form.getAttribute("data-form");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var fd = new FormData(form);
      var id = fieldValue(fd, "id");
      var item = buildItem(key, id, fd);
      var list = content[key] || (content[key] = []);
      var index = id ? findIndexById(list, id) : -1;
      var isEditing = index > -1;

      if (isEditing) {
        list[index] = item;
      } else if (key === "news") {
        list.unshift(item);
      } else {
        list.push(item);
      }

      if (!saveOrWarn()) return;
      renderAll();
      resetForm(form);
      toast(isEditing ? "Perubahan tersimpan." : "Konten baru ditambahkan.");
    });

    var cancel = form.querySelector("[data-cancel]");
    if (cancel) {
      cancel.addEventListener("click", function () {
        resetForm(form);
      });
    }
  });

  listBoxes.forEach(function (box) {
    var key = box.getAttribute("data-list");

    box.addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (!button) return;

      var id = button.getAttribute("data-id");
      var index = findIndexById(content[key] || [], id);
      if (index === -1) return;

      if (button.getAttribute("data-action") === "edit") {
        startEdit(key, id);
        return;
      }

      var item = content[key][index];
      if (!window.confirm('Hapus "' + item.title + '"? Tindakan ini tidak bisa dibatalkan.')) return;

      var removed = content[key].splice(index, 1)[0];
      if (!saveOrWarn()) {
        content[key].splice(index, 0, removed);
        return;
      }
      renderAll();
      resetForm($('[data-form="' + key + '"]'));
      toast("Konten dihapus.");
    });
  });

  /* ---------------------------------------------------------------------
     5. Pilihan foto & ikon
     --------------------------------------------------------------------- */
  $$("[data-image-select]").forEach(function (select) {
    store.IMAGE_OPTIONS.forEach(function (option) {
      var el = document.createElement("option");
      el.value = option.src;
      el.textContent = option.label;
      select.appendChild(el);
    });
  });

  $$("[data-icon-select]").forEach(function (select) {
    store.ICON_OPTIONS.forEach(function (option) {
      var el = document.createElement("option");
      el.value = option.value;
      el.textContent = option.label;
      select.appendChild(el);
    });
  });

  /* ---------------------------------------------------------------------
     6. Ekspor, impor, reset, kata sandi
     --------------------------------------------------------------------- */
  function toast(message) {
    var el = $("#adminToast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2800);
  }

  var exportBtn = $("#exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(store.load(), null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "konten-smk-bintang-nusantara-2.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast("Cadangan JSON diunduh.");
    });
  }

  var importFile = $("#importFile");
  var importStatus = $("#importStatus");

  if (importFile) {
    importFile.addEventListener("change", function () {
      var file = importFile.files && importFile.files[0];
      if (!file) return;

      var reader = new FileReader();

      reader.onload = function () {
        try {
          var parsed = JSON.parse(String(reader.result));
          if (!parsed || typeof parsed !== "object") throw new Error("format");

          if (!window.confirm("Impor file ini dan ganti seluruh konten saat ini?")) {
            importFile.value = "";
            return;
          }

          content = store.normalize(parsed);
          if (!saveOrWarn()) {
            importFile.value = "";
            return;
          }
          renderAll();
          resetAllForms();

          if (importStatus) {
            importStatus.hidden = false;
            importStatus.classList.remove("is-error");
            importStatus.textContent = "Berhasil mengimpor data dari " + file.name + ".";
          }
          toast("Data berhasil diimpor.");
        } catch (error) {
          if (importStatus) {
            importStatus.hidden = false;
            importStatus.classList.add("is-error");
            importStatus.textContent = "File tidak valid. Gunakan file JSON hasil ekspor panel ini.";
          }
        }

        importFile.value = "";
      };

      reader.onerror = function () {
        if (importStatus) {
          importStatus.hidden = false;
          importStatus.classList.add("is-error");
          importStatus.textContent = "Gagal membaca file. Coba lagi.";
        }
        importFile.value = "";
      };

      reader.readAsText(file);
    });
  }

  var resetBtn = $("#resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!window.confirm("Kembalikan semua konten ke data awal? Perubahan yang belum diekspor akan hilang.")) return;
      content = store.reset();
      renderAll();
      resetAllForms();
      toast("Konten dikembalikan ke data awal.");
    });
  }

  var passwordForm = $("#passwordForm");
  var passwordError = $("#passwordError");

  if (passwordForm) {
    passwordForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var fd = new FormData(passwordForm);
      var current = String(fd.get("current") || "");
      var next = String(fd.get("next") || "");
      var confirmValue = String(fd.get("confirm") || "");

      if (hashPassword(current) !== savedPassword()) {
        passwordError.hidden = false;
        passwordError.textContent = "Kata sandi saat ini salah.";
        return;
      }

      if (next.length < 6 || next !== confirmValue) {
        passwordError.hidden = false;
        passwordError.textContent = "Kata sandi baru minimal 6 karakter dan harus sama pada kedua kolom.";
        return;
      }

      try {
        window.localStorage.setItem(PASS_KEY, hashPassword(next));
      } catch (error) {
        passwordError.hidden = false;
        passwordError.textContent = "Tidak bisa menyimpan kata sandi di browser ini.";
        return;
      }

      passwordForm.reset();
      passwordError.hidden = true;
      toast("Kata sandi diperbarui.");
    });
  }

  /* ---------------------------------------------------------------------
     7. Inisialisasi
     --------------------------------------------------------------------- */
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (hasSession()) {
    showApp();
  } else if (loginPassword) {
    window.setTimeout(function () { loginPassword.focus(); }, 120);
  }
})();
