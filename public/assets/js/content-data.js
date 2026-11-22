/* ==========================================================================
   SMK Bintang Nusantara 2 — data awal konten berita & akademik
   Data ini dipakai saat localStorage masih kosong, dan menjadi cadangan
   ketika data tersimpan tidak bisa dibaca.
   ========================================================================== */
window.SCHOOL_CONTENT_DEFAULTS = {
  version: 1,
  news: [
    {
      id: "news-01",
      date: "2026-07-13",
      tag: "Pengumuman",
      title: "Tahun ajaran 2026/2027 resmi dimulai",
      text: "Sebanyak 23 siswa kelas 10 memulai kegiatan belajar di dua kompetensi keahlian: Teknik Sepeda Motor dan Tata Busana.",
      image: "assets/img/siswa.jpg"
    },
    {
      id: "news-02",
      date: "2026-07-22",
      tag: "Praktik",
      title: "Praktik perdana jurusan Tata Busana",
      text: "Siswa mulai mengenal mesin jahit, membuat pola dasar, dan menyelesaikan produk busana sederhana di ruang praktik.",
      image: "assets/img/jahit-1.jpg"
    },
    {
      id: "news-03",
      date: "2026-07-29",
      tag: "Kegiatan",
      title: "Pembiasaan mengaji sebelum pembelajaran",
      text: "Kegiatan membaca Al-Qur'an bersama dilaksanakan setiap pagi untuk membentuk karakter religius dan disiplin siswa.",
      image: "assets/img/mengaji-1.jpg"
    },
    {
      id: "news-04",
      date: "2026-08-05",
      tag: "Kemitraan",
      title: "Menjalin kerja sama dengan bengkel lokal",
      text: "Jurusan Teknik Sepeda Motor menggandeng bengkel di sekitar Tanjung Bintang untuk mendukung praktik kerja siswa.",
      image: "assets/img/acara-2.jpg"
    },
    {
      id: "news-05",
      date: "2026-08-17",
      tag: "Kegiatan",
      title: "Peringatan HUT Kemerdekaan RI",
      text: "Siswa dan guru mengikuti upacara serta kegiatan sosial di lingkungan sekolah untuk memperingati hari kemerdekaan.",
      image: "assets/img/sosial.jpg"
    },
    {
      id: "news-06",
      date: "2026-09-21",
      tag: "Akademik",
      title: "Penilaian Tengah Semester Ganjil",
      text: "Seluruh siswa kelas 10 mengikuti penilaian tengah semester untuk mata pelajaran umum dan produktif.",
      image: "assets/img/kelas.jpg"
    }
  ],
  calendar: [
    {
      id: "cal-01",
      day: "13",
      month: "Jul 2026",
      title: "Awal tahun ajaran 2026/2027",
      text: "Hari pertama kegiatan sekolah dan penyambutan siswa kelas 10.",
      holiday: false
    },
    {
      id: "cal-02",
      day: "14–18",
      month: "Jul 2026",
      title: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
      text: "Pengenalan lingkungan, guru, tata tertib, dan program jurusan.",
      holiday: false
    },
    {
      id: "cal-03",
      day: "20",
      month: "Jul 2026",
      title: "Hari pertama pembelajaran",
      text: "Kegiatan belajar mengajar dimulai sesuai jadwal masing-masing jurusan.",
      holiday: false
    },
    {
      id: "cal-04",
      day: "17",
      month: "Agu 2026",
      title: "Libur HUT Kemerdekaan RI",
      text: "Kegiatan belajar diliburkan. Siswa mengikuti upacara di lingkungan masing-masing.",
      holiday: true
    },
    {
      id: "cal-05",
      day: "21–26",
      month: "Sep 2026",
      title: "Penilaian Tengah Semester Ganjil",
      text: "Penilaian tengah semester untuk mata pelajaran umum dan produktif.",
      holiday: false
    },
    {
      id: "cal-06",
      day: "7–12",
      month: "Des 2026",
      title: "Penilaian Akhir Semester Ganjil",
      text: "Penilaian akhir semester sebelum pembagian rapor semester ganjil.",
      holiday: false
    },
    {
      id: "cal-07",
      day: "19–31",
      month: "Des 2026",
      title: "Libur semester ganjil",
      text: "Libur akhir semester. Kegiatan belajar kembali pada awal Januari 2027.",
      holiday: true
    }
  ],
  achievements: [
    {
      id: "ach-01",
      level: "Tingkat Kabupaten",
      title: "Juara 2 Lomba Kompetensi Siswa Teknik Sepeda Motor",
      text: "Perwakilan jurusan TSM meraih juara kedua pada lomba servis sepeda motor antar-SMK se-Kabupaten Lampung Selatan.",
      year: "2026",
      icon: "trophy"
    },
    {
      id: "ach-02",
      level: "Tingkat Kabupaten",
      title: "Juara 3 Lomba Desain Busana",
      text: "Siswa jurusan Tata Busana meraih juara ketiga pada lomba desain dan pembuatan pola tingkat kabupaten.",
      year: "2026",
      icon: "scissors"
    },
    {
      id: "ach-03",
      level: "Antar Pelajar",
      title: "Juara 1 Turnamen Voli Antar Pelajar",
      text: "Tim voli putra sekolah menjuarai turnamen persahabatan antar pelajar di Kecamatan Tanjung Bintang.",
      year: "2026",
      icon: "globe"
    }
  ]
};
