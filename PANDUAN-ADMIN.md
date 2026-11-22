# Panduan Admin — SMK Bintang Nusantara 2

Panduan singkat untuk mengelola berita, prestasi, dan kegiatan sekolah lewat
panel admin.

## 1. Masuk ke panel admin

1. Buka `https://<domain-sekolah>/admin/login`.
2. Masukkan username dan password admin.
3. Setelah berhasil, kamu akan diarahkan ke dashboard berita.

Lupa password? Minta pengelola teknis mengganti hash password langsung di
database Supabase (lihat bagian **Pemulihan akun** di bawah).

## 2. Menulis berita baru

1. Klik **+ Tulis Berita** atau menu **Tulis Baru**.
2. Isi:
   - **Judul** (3–180 karakter).
   - **Isi berita** — pisahkan antarparagraf dengan satu baris kosong.
   - **Ringkasan** (opsional, maksimal 320 karakter). Jika dikosongkan, sistem
     mengambil otomatis dari isi berita.
   - **Kategori**: Berita, Prestasi, atau Kegiatan.
3. Centang **Terbitkan di website** agar tulisan langsung tampil. Jika tidak
   dicentang, tulisan disimpan sebagai draf dan tidak terlihat pengunjung.
4. Klik **Simpan berita**.

## 3. Mengunggah gambar utama

1. Di panel **Gambar utama**, pilih file JPG, PNG, atau WEBP (maksimal 6 MB).
2. Gambar langsung diunggah ke Supabase Storage. Tunggu sampai preview muncul
   dan tulisan **"Mengunggah gambar…"** hilang.
3. Klik **Simpan berita** untuk menyimpan perubahan.

Untuk mengganti gambar, unggah file baru. Untuk menghapus, centang
**Hapus gambar ini** lalu simpan.

## 4. Mengedit, menerbitkan, dan menghapus

- **Edit**: klik tombol **Edit** pada baris berita.
- **Terbitkan / Sembunyikan**: tombol di kolom Aksi. Berita berstatus draf tidak
  tampil di website.
- **Hapus**: tombol **Hapus** (perlu konfirmasi). Gambar unggahan ikut dihapus
  dari Supabase Storage.

## 5. Ganti password

1. Buka menu **Password** di panel admin.
2. Masukkan password saat ini, password baru (minimal 8 karakter), lalu ulangi.
3. Klik **Ganti password**.

## 6. Pemulihan akun

Jika password admin hilang:

1. Masuk ke dashboard Supabase → **SQL Editor**.
2. Jalankan query berikut dengan hash bcrypt baru (buat hash dengan
   `node -e "console.log(require('bcryptjs').hashSync('PASSWORD_BARU', 12))"`
   di folder proyek):

   ```sql
   update admins
   set password_hash = '<hash-baru>', updated_at = now()
   where username = 'admin';
   ```

3. Login kembali dengan password baru.

Untuk menambah admin lain, ulangi langkah di atas dengan `insert into admins`.

## 7. Catatan teknis

- Data berita tersimpan di tabel `posts` pada Supabase (PostgreSQL).
- Gambar tersimpan di bucket Storage `foto` (public read, maksimal 6 MB).
- Website publik: `/` dan `/berita`. Detail berita: `/berita/<slug>`.
- Panel admin hanya bisa diakses setelah login; cookie sesi berlaku 7 hari.
- Login dibatasi 5 percobaan gagal per 10 menit.
