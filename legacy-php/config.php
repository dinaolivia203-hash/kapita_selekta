<?php
/**
 * Konfigurasi utama website SMK Bintang Nusantara 2.
 *
 * Bagian yang perlu diubah saat upload ke cPanel adalah "db" di bawah ini.
 * Gunakan data dari cPanel > MySQL Databases.
 */

return [
    'site' => [
        'name'     => 'SMK Bintang Nusantara 2',
        'tagline'  => 'Tanjungbintang · Lampung Selatan',
        'timezone' => 'Asia/Jakarta',
    ],

    'db' => [
        // 'mysql' untuk hosting cPanel (produksi), 'sqlite' hanya untuk uji lokal.
        'driver'  => getenv('APP_DB_DRIVER') ?: 'mysql',

        // Isi sesuai cPanel > MySQL Databases.
        'host'    => 'localhost',
        'port'    => 3306,
        'name'    => 'smkbinus2',
        'user'    => 'smkbinus2',
        'pass'    => '',
        'charset' => 'utf8mb4',

        // Dipakai hanya jika driver = sqlite.
        'sqlite'  => __DIR__ . '/storage/database.sqlite',
    ],

    'uploads' => [
        'dir'      => __DIR__ . '/assets/img/berita',
        'url'      => 'assets/img/berita',
        'max_size' => 6 * 1024 * 1024, // 6 MB
    ],

    // Tampilkan pesan error PHP. Biarkan false saat online.
    'debug' => getenv('APP_DEBUG') === '1',
];
