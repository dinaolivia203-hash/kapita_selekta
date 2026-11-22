<?php
/**
 * Header panel admin.
 *
 * Variabel yang dipakai: $pageTitle, $activeNav (posts|new|edit).
 * Wajib dimuat setelah bootstrap dan require_admin().
 */

$admin = current_admin();
$pageTitle = $pageTitle ?? 'Panel Admin';
$activeNav = $activeNav ?? 'posts';
$flashes = take_flashes();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= e($pageTitle) ?> — SMK Bintang Nusantara 2</title>
  <link rel="icon" type="image/png" href="<?= e(url('assets/img/logo.png')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('admin/admin.css')) ?>">
</head>
<body>
  <header class="admin-topbar">
    <div class="admin-topbar__inner">
      <a class="admin-brand" href="<?= e(url('admin/index.php')) ?>">
        <img src="<?= e(url('assets/img/logo.png')) ?>" alt="">
        <span>
          <strong>Panel Admin</strong>
          <small>SMK Bintang Nusantara 2</small>
        </span>
      </a>

      <nav class="admin-nav" aria-label="Navigasi panel admin">
        <a class="<?= $activeNav === 'posts' ? 'is-active' : '' ?>" href="<?= e(url('admin/index.php')) ?>">Berita</a>
        <a class="<?= $activeNav === 'new' ? 'is-active' : '' ?>" href="<?= e(url('admin/post.php')) ?>">Tulis Baru</a>
        <a class="admin-nav__site" href="<?= e(url('index.html')) ?>#berita" target="_blank" rel="noopener">Lihat Situs ↗</a>
        <span style="padding:0 4px;font-size:11.5px;color:rgba(255,255,255,.45)"><?= e($admin['name'] ?? '') ?></span>
        <form class="admin-logout" method="post" action="<?= e(url('admin/logout.php')) ?>">
          <?= csrf_field() ?>
          <button type="submit">Keluar</button>
        </form>
      </nav>
    </div>
  </header>

  <main class="admin-main">
    <?php foreach ($flashes as $item): ?>
      <div class="alert alert--<?= e($item['type'] === 'success' ? 'success' : ($item['type'] === 'error' ? 'error' : 'info')) ?>" style="margin-bottom:16px">
        <span><?= e($item['msg']) ?></span>
      </div>
    <?php endforeach; ?>
