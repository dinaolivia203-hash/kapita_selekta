# Website Profil SMK Bintang Nusantara 2

Website profil sekolah dengan navigasi berbasis tab — Beranda, Profil, Jurusan,
Fasilitas, Galeri, Berita, dan Kontak — plus panel admin untuk mengelola berita,
prestasi, dan kegiatan sekolah.

- **Frontend publik**: HTML/CSS/JavaScript statis (`public/`) agar halaman beranda
  tetap ringan.
- **Halaman berita & admin**: Next.js App Router (React 19).
- **Database**: Supabase (PostgreSQL).
- **Penyimpanan gambar**: Supabase Storage (bucket `foto`).
- **Hosting**: Vercel.

## Menjalankan di komputer

1. Pastikan Node.js 20+ terpasang.
2. Salin `.env.example` menjadi `.env.local`, lalu isi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
   SUPABASE_SERVICE_ROLE_KEY=<secret key>
   SUPABASE_STORAGE_BUCKET=foto
   AUTH_SECRET=<string acak minimal 32 karakter>
   DATABASE_URL=postgresql://...   # hanya untuk migrasi
   ```

   Buat `AUTH_SECRET` dengan:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

3. Pasang dependensi dan migrasi database:

   ```bash
   npm install
   npm run migrate
   ```

   `npm run migrate` membuat tabel, mengaktifkan RLS, menyiapkan bucket Storage,
   membuat akun admin pertama, dan mengisi berita contoh (hanya jika tabel kosong).

4. Jalankan server:

   ```bash
   npm run dev
   ```

5. Buka:

   - Website: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin/login`

Akun admin awal mengikuti `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`
(default: `admin` / `Kapita2026`). **Segera ganti password** setelah login pertama
dengan membuat hash baru di database (lihat bagian Keamanan).

## Deploy ke Vercel

1. Login ke Vercel:

   ```bash
   npx vercel login
   ```

2. Hubungkan folder proyek:

   ```bash
   npx vercel link
   ```

3. Tambahkan environment variables (untuk Production, Preview, dan Development):

   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   npx vercel env add SUPABASE_STORAGE_BUCKET
   npx vercel env add AUTH_SECRET
   ```

   `DATABASE_URL` tidak perlu di Vercel — hanya dipakai saat migrasi lokal.

4. Deploy:

   ```bash
   npx vercel --prod
   ```

## Struktur

```
app/
  layout.tsx                 Layout akar
  (public)/layout.tsx        Memuat CSS/font halaman publik
  (public)/berita/           Daftar & detail berita
  admin/login/               Login admin
  admin/(panel)/             Dashboard & form tulis/edit berita
  api/posts/route.ts         Feed JSON untuk beranda & tab Berita
  api/admin/upload-sign/     Signed URL unggah gambar ke Supabase Storage
components/                  Header, footer, kartu berita, navigasi admin
lib/                         Koneksi Supabase, sesi admin, query berita, util
scripts/migrate.mjs          Migrasi tabel + seed
public/
  index.html                 Beranda (semua tab)
  assets/css/style.css       Tampilan website
  assets/js/main.js          Navigasi tab, slider, pemuatan berita
  assets/admin.css           Tampilan panel admin
  assets/img/                Foto & logo sekolah
legacy-php/                  Kode PHP versi lama (arsip, tidak dipakai)
```

## Alur data

- Beranda dan tab **Berita** memanggil `GET /api/posts?limit=…&kategori=…`.
- API hanya mengembalikan tulisan berstatus terbit.
- Detail berita ada di `/berita/<slug>`.
- Status **Draf** tidak tampil untuk pengunjung.
- Isi berita berupa teks biasa; baris kosong menjadi paragraf baru dan semua
  teks di-escape oleh React.

## Keamanan

- Password admin di-hash dengan bcrypt (cost 12).
- Sesi memakai JWT bertanda tangan (`AUTH_SECRET`) di cookie `HttpOnly`,
  `SameSite=Lax`, dan `Secure` saat produksi.
- RLS aktif di semua tabel; tidak ada policy publik. Semua akses database
  melewati server Next.js dengan service role key.
- Login dibatasi 5 percobaan gagal per 10 menit (per username + IP).
- Unggahan gambar divalidasi tipe & ukuran (maks. 6 MB), diunggah langsung ke
  Supabase Storage lewat signed URL, dan memakai nama acak.
- Service role key tidak pernah dikirim ke browser; file `.env.local` diabaikan git.

## Bagan guru & tenaga kependidikan

Ada di tab **Profil**, bagian "Struktur Organisasi" (`public/index.html`, blok `.org`).

| Bagian | Nama | Keterangan |
| --- | --- | --- |
| Kepala Sekolah | Agus Fedric, S.Pd. | data asli |
| Tata Usaha | Rina Marlina | Kepala Tata Usaha (dummy) |
| Tata Usaha | Yoga Saputra | Staf Administrasi (dummy) |
| Guru Teknik Sepeda Motor | Budi Santoso, S.T. | Guru Produktif TSM (dummy) |
| Guru Teknik Sepeda Motor | Rizky Pratama, S.Pd. | Guru Umum (dummy) |
| Guru Tata Busana | Dewi Lestari, S.Pd. | Guru Produktif Tata Busana (dummy) |
| Guru Tata Busana | Siti Aminah, S.Pd. | Guru Umum (dummy) |

Semua nama selain kepala sekolah masih data sementara dan ditandai catatan kecil
di bawah bagan.

## Data sekolah yang dipakai

| Data | Nilai |
| --- | --- |
| Nama | SMK Bintang Nusantara 2 |
| NPSN | 70009003 |
| Berdiri | 13 Juli 2026 |
| Alamat | Jl. Endro Surmin Gg. Pondok Dusun Negeri 5B, Desa Way Galih, Kec. Tanjungbintang, Lampung Selatan 35365 |
| Kelas | Kelas 10 |
| Jurusan | Teknik Sepeda Motor (13 siswa), Tata Busana (10 siswa) |
| Total siswa | 23 |
| Fasilitas | 3 ruang belajar, 2 ruang praktik, ruang guru & kepala sekolah, 1 lapangan voli, 1 lapangan futsal, kantin umum, 3 kamar mandi |

## Cara mengubah

- **Teks / data sekolah**: ubah `public/index.html`.
- **Nama di bagan guru**: ubah blok `.org` di `public/index.html`.
- **Foto hero / galeri**: ganti file di `public/assets/img/` atau ubah markup terkait.
- **Warna**: variabel di bagian atas `public/assets/css/style.css`.
- **Berita**: lewat panel admin di `/admin`.
- **Berita contoh**: ada di `scripts/migrate.mjs` (hanya dipakai saat tabel kosong).
