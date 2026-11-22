(function () {
  "use strict";

  var card = document.getElementById("principalCard");
  if (!card) return;

  var photoInput = document.getElementById("principalPhotoUpload");
  var photo = document.getElementById("principalPhoto");
  var editBtn = document.getElementById("principalEditBtn");
  var editLabel = document.getElementById("principalEditLabel");
  var shuffleBtn = document.getElementById("principalShuffleBtn");
  var cleanBtn = document.getElementById("principalCleanBtn");
  var downloadBtn = document.getElementById("principalDownloadBtn");
  var toolbar = document.getElementById("principalToolbar");
  var showBtn = document.getElementById("principalToolbarShow");

  var quoteEl = card.querySelector(".principal-card__quote");
  var authorEl = card.querySelector(".principal-card__author");
  var roleEl = card.querySelector(".principal-card__role");
  var editableEls = card.querySelectorAll("[data-editable]");

  var quotes = [
    {
      text: "Pendidikan bukan hanya soal memindahkan materi pelajaran, tetapi tentang menumbuhkan karakter, rasa ingin tahu, dan keberanian untuk mencoba. Di SMK Bintang Nusantara 2, setiap siswa memiliki potensi yang perlu dirawat dengan pendampingan yang sabar.",
      author: "Agus Fedric, S.Pd.",
      role: "Kepala SMK Bintang Nusantara 2",
    },
    {
      text: "Pendidikan adalah senjata paling ampuh untuk mengubah dunia.",
      author: "Nelson Mandela",
      role: "Tokoh perdamaian & pendidikan",
    },
    {
      text: "Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani.",
      author: "Ki Hajar Dewantara",
      role: "Bapak Pendidikan Indonesia",
    },
    {
      text: "Anak-anak hidup dan tumbuh sesuai kodratnya sendiri. Pendidik hanya dapat merawat dan menuntun tumbuhnya kodrat itu.",
      author: "Ki Hajar Dewantara",
      role: "Bapak Pendidikan Indonesia",
    },
    {
      text: "Pendidikan bukanlah proses mengisi wadah yang kosong, melainkan menyalakan api yang ada di dalam diri setiap anak.",
      author: "Socrates",
      role: "Filsuf Yunani",
    },
  ];

  var quoteIndex = 0;

  function setEditing(next) {
    editableEls.forEach(function (el) {
      el.setAttribute("contenteditable", next ? "true" : "false");
      el.spellcheck = false;
    });

    card.classList.toggle("is-editing", next);
    if (editBtn) {
      editBtn.classList.toggle("is-active", next);
      editBtn.setAttribute("aria-pressed", String(next));
    }
    if (editLabel) {
      editLabel.textContent = next ? "Selesai Edit" : "Edit Teks";
    }
  }

  setEditing(false);

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      setEditing(!card.classList.contains("is-editing"));
    });
  }

  if (photoInput) {
    photoInput.addEventListener("change", function () {
      var file = photoInput.files && photoInput.files[0];
      if (!file) return;

      if (!file.type || file.type.indexOf("image/") !== 0) {
        window.alert("Pilih file gambar (JPG, PNG, atau format gambar lain).");
        photoInput.value = "";
        return;
      }

      var reader = new FileReader();
      reader.onload = function (event) {
        if (photo && event.target && event.target.result) {
          photo.src = String(event.target.result);
        }
        photoInput.value = "";
      };
      reader.readAsDataURL(file);
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      if (quotes.length < 2) return;

      quoteIndex = (quoteIndex + 1) % quotes.length;
      var item = quotes[quoteIndex];

      card.classList.add("quote-fade");
      window.setTimeout(function () {
        if (quoteEl) quoteEl.textContent = item.text;
        if (authorEl) authorEl.textContent = item.author;
        if (roleEl) roleEl.textContent = item.role;
        window.requestAnimationFrame(function () {
          card.classList.remove("quote-fade");
        });
      }, 180);
    });
  }

  function setCleanMode(clean) {
    if (!toolbar || !showBtn) return;
    toolbar.classList.toggle("is-hidden", clean);
    showBtn.classList.toggle("is-visible", clean);
  }

  if (cleanBtn) {
    cleanBtn.addEventListener("click", function () {
      setCleanMode(true);
    });
  }

  if (showBtn) {
    showBtn.addEventListener("click", function () {
      setCleanMode(false);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      if (typeof window.html2canvas !== "function") {
        window.alert(
          "Fitur unduh belum siap. Periksa koneksi internet, lalu muat ulang halaman.",
        );
        return;
      }

      var label = downloadBtn.querySelector("span");
      var originalLabel = label ? label.textContent : "Unduh PNG";

      downloadBtn.disabled = true;
      if (label) label.textContent = "Menyiapkan…";

      window
        .html2canvas(card, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          logging: false,
        })
        .then(function (canvas) {
          var link = document.createElement("a");
          link.download = "kartu-kepala-sekolah-smk-bintang-nusantara-2.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        })
        .catch(function () {
          window.alert("Gagal membuat gambar kartu. Silakan coba lagi.");
        })
        .then(function () {
          downloadBtn.disabled = false;
          if (label) label.textContent = originalLabel;
        });
    });
  }
})();
