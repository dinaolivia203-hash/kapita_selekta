HEAD
# kapita_selekta

# Website Profil SMK Bintang Nusantara 2

Website profil sekolah (static) dengan navigasi berbasis tab: Beranda, Profil, Fasilitas,
Galeri, Berita Sekolah, Akademik (dropdown: Jurusan, Kalender Akademik, Prestasi), dan
Kontak. Setiap menu membuka halamannya sendiri tanpa reload, dan Beranda memiliki hero
foto yang berganti otomatis.

## Menjalankan

- Klik dua kali `index.html`, atau
- Jalankan server lokal dari folder ini:

```bash
python -m http.server 8000
```

lalu buka `http://localhost:8000`.

## Struktur

```
index.html                 Halaman utama (semua tab ada di file ini)
admin.html                 Panel operator untuk mengelola berita & akademik
assets/css/style.css       Semua tampilan website (warna, layout, responsif)
assets/css/admin.css       Tampilan khusus panel admin
assets/js/content-data.js  Data awal berita, kalender, dan prestasi
assets/js/content-store.js Penyimpanan localStorage + render konten ke halaman
assets/js/main.js          Navigasi tab, slider foto, animasi, tinggi header
assets/js/admin.js         Logika panel admin (login, tambah/edit/hapus, ekspor)
assets/img/                Logo sekolah + foto kegiatan
```

## Navigasi tab

- Setiap tab adalah `<div class="tab-panel" id="...">` di `index.html`. Hanya satu tab
  yang terlihat; sisanya memakai atribut `hidden`.
- Semua tautan `href="#profil"`, `#jurusan`, dan seterusnya ditangani oleh `assets/js/main.js`
  (fungsi `showTab`), lalu `history.pushState` dipakai agar tombol Back/Forward browser dan
  URL seperti `index.html#galeri` tetap bekerja.
- Menu utama selalu tampil di semua ukuran layar, tanpa tombol hamburger. Di layar kecil
  menu menjadi dua baris di bawah logo.
- Tinggi header diukur otomatis lewat CSS variable `--header-h`, sehingga konten dan hero
  tidak tertutup header.

## Panel admin (berita & akademik)

Buka `admin.html` (atau klik tautan **Admin** di bagian bawah footer).

- Kata sandi awal: **`admin123`**. Ubah melalui tab **Data & Pengaturan** setelah masuk.
- Tab **Berita Sekolah**: tambah, edit, dan hapus berita. Berita baru tampil paling depan.
- Tab **Kalender Akademik**: tambah, edit, dan hapus agenda; centang "hari libur" untuk
  memberi warna khusus.
- Tab **Prestasi**: tambah, edit, dan hapus prestasi beserta tingkat, tahun, dan ikon.
- Perubahan langsung terlihat di website (tab lain yang sudah terbuka ikut diperbarui).

**Penyimpanan.** Konten disimpan di `localStorage` browser, bukan di server. Artinya:

- Perubahan hanya terlihat di browser/komputer tempat operator mengedit.
- Untuk memindahkan konten ke komputer lain, gunakan **Ekspor data** (file JSON), lalu
  **Impor data** di komputer tujuan.
- Pengunci kata sandi hanya membatasi tampilan panel, bukan pengamanan server.

Data awal (jika localStorage kosong) ada di `assets/js/content-data.js`. Tombol
**Reset ke data awal** mengosongkan penyimpanan dan memakai data tersebut.

## Bagan guru & tenaga kependidikan

Ada di tab **Profil**, bagian "Struktur Organisasi":

| Bagian | Nama | Keterangan |
| --- | --- | --- |
| Kepala Sekolah | Agus Fedric, S.Pd. | data asli |
| Tata Usaha | Rina Marlina | Kepala Tata Usaha (dummy) |
| Tata Usaha | Yoga Saputra | Staf Administrasi (dummy) |
| Guru Teknik Sepeda Motor | Budi Santoso, S.T. | Guru Produktif TSM (dummy) |
| Guru Teknik Sepeda Motor | Rizky Pratama, S.Pd. | Guru Umum (dummy) |
| Guru Tata Busana | Dewi Lestari, S.Pd. | Guru Produktif Tata Busana (dummy) |
| Guru Tata Busana | Siti Aminah, S.Pd. | Guru Umum (dummy) |

Semua nama selain kepala sekolah masih berupa **data sementara** dan ditandai dengan
catatan kecil di bawah bagan. Ganti nama pada blok `.org` di `index.html` setelah data
guru sebenarnya tersedia.

## Data sekolah yang dipakai

| Data | Nilai |
| --- | --- |
| Nama | SMK Bintang Nusantara 2 |
| NPSN | 70009003 |
| Berdiri | 13 Juli 2026 |
| Alamat | Jl. Endro Surmin Gg. Pondok Dusun Negeri 5B, Desa Way Galih, Kec. Tanjung Bintang, Lampung Selatan 35365 |
| Kelas | Kelas 10 |
| Jurusan | Teknik Sepeda Motor (13 siswa), Tata Busana (10 siswa) |
| Total siswa | 23 |
| Fasilitas | 3 ruang belajar, 2 ruang praktik, ruang guru & kepala sekolah, 1 lapangan voli, 1 lapangan futsal, kantin umum, 3 kamar mandi |

## Cara mengubah

- **Berita, kalender akademik, prestasi**: gunakan panel `admin.html` (lihat bagian di atas).
- **Teks / data**: cari bagian yang sesuai di `index.html` (misalnya `23 siswa`, `NPSN`, alamat).
- **Nama di bagan guru**: ubah blok `.org` di `index.html` (kartu `.org__leader`,
  `.org__unit`, dan daftar `.org__people`).
- **Menambah / mengganti tab**: buat `<div class="tab-panel" id="baru" hidden>` di `index.html`,
  lalu tambahkan tautan `<a class="nav__link" href="#baru">` di menu dan footer. ID tab
  otomatis dikenali oleh `main.js`.
- **Foto hero (slide)**: ganti file di `assets/img/` atau ubah daftar `<figure class="hero__slide">`
  beserta `data-caption`, jumlah titik navigasi (`.dot`) dan teks `01 / 05`.
- **Galeri**: ubah blok `.gallery__item` di `index.html`.
- **Warna**: ubah variabel di bagian atas `assets/css/style.css` (`--navy-800`, `--sky-300`,
  dan seterusnya).
- **Kecepatan slide**: atur `data-autoplay="6000"` (milidetik) pada elemen `.hero__slider`.

Semua foto di `assets/img/` sudah diperkecil (maksimal 1600 px) agar halaman tetap ringan.
 3364aea (membuat web smk binus 2)