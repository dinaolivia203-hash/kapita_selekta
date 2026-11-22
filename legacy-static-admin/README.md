# Arsip panel admin statis (versi origin/main)

File di folder ini berasal dari `origin/main` sebelum migrasi ke Next.js + Supabase:

- `admin.html` — panel admin versi localStorage
- `assets/css/admin.css` — tampilan panel admin statis
- `assets/js/admin.js` — logika panel admin statis
- `assets/js/content-data.js` — data awal berita/kalender/prestasi
- `assets/js/content-store.js` — penyimpanan localStorage + render konten

Panel admin tersebut digantikan oleh panel Next.js di `/admin` yang memakai Supabase
sebagai sumber data. File di sini disimpan sebagai referensi dan **tidak dipakai**
oleh aplikasi yang di-deploy.

Fitur publik dari versi tersebut (tab Akademik, Kalender, Prestasi) tidak diport ke
versi Next.js saat migrasi. Untuk melihat versi lengkapnya, gunakan commit
`1f3a3bb` (origin/main sebelum migrasi).
