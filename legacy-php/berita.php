<?php
/**
 * Halaman publik berita sekolah.
 * - berita.php                → daftar semua berita
 * - berita.php?kategori=...   → daftar per kategori
 * - berita.php?slug=...       → detail berita
 */

declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';

$slug = trim((string) ($_GET['slug'] ?? ''));
$post = null;
$posts = [];
$related = [];
$isDetail = $slug !== '';

if ($isDetail) {
    $post = find_post_by_slug($slug);

    if ($post) {
        foreach (find_posts('', 6) as $candidate) {
            if ((int) $candidate['id'] === (int) $post['id']) {
                continue;
            }
            $related[] = $candidate;

            if (count($related) === 3) {
                break;
            }
        }
    } else {
        http_response_code(404);
    }
} else {
    $category = strtolower(trim((string) ($_GET['kategori'] ?? '')));
    if ($category !== '' && !array_key_exists($category, categories())) {
        $category = '';
    }

    $posts = find_posts($category, 24);
}

$pageTitle = $post
    ? $post['title'] . ' — SMK Bintang Nusantara 2'
    : 'Berita, Prestasi & Kegiatan — SMK Bintang Nusantara 2';

$description = $post
    ? (string) $post['excerpt']
    : 'Kabar terbaru, prestasi siswa, dan kegiatan SMK Bintang Nusantara 2, Tanjungbintang, Lampung Selatan.';

$homeBeranda = url('index.html') . '#beranda';
$homeBerita = url('index.html') . '#berita';
$homeKontak = url('index.html') . '#kontak';
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?></title>
  <meta name="description" content="<?= e($description) ?>">
  <meta name="theme-color" content="#06122e">
  <link rel="icon" type="image/png" href="<?= e(url('assets/img/logo.png')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?>">
  <script>document.documentElement.classList.add("js");</script>
</head>
<body>
  <a class="skip-link" href="#konten">Langsung ke konten</a>

  <header class="page-header">
    <div class="container page-header__inner">
      <a class="brand" href="<?= e($homeBeranda) ?>">
        <img class="brand__logo" src="<?= e(url('assets/img/logo.png')) ?>" alt="Logo SMK Bintang Nusantara 2" width="44" height="44">
        <span class="brand__text">
          <strong>SMK BINTANG NUSANTARA 2</strong>
          <small>Tanjungbintang · Lampung Selatan</small>
        </span>
      </a>

      <nav class="page-header__nav" aria-label="Navigasi halaman">
        <a href="<?= e($homeBeranda) ?>">Beranda</a>
        <a href="<?= e($homeBerita) ?>">Berita</a>
        <a href="<?= e($homeKontak) ?>">Kontak</a>
      </nav>
    </div>
  </header>

  <main id="konten" class="page-main">
    <?php if ($isDetail && !$post): ?>
      <section class="section">
        <div class="container article__container">
          <p class="eyebrow">404</p>
          <h1 class="article__title">Berita tidak ditemukan</h1>
          <p class="article__excerpt">Tulisan ini mungkin sudah dihapus atau alamatnya berubah.</p>
          <p style="margin-top:22px"><a class="btn btn--primary" href="<?= e(url('berita.php')) ?>">Lihat semua berita</a></p>
        </div>
      </section>

    <?php elseif ($post): ?>
      <article class="section">
        <div class="container article__container">
          <a class="article__back" href="<?= e($homeBerita) ?>">← Kembali ke Berita</a>

          <p class="article__meta">
            <span class="badge badge--<?= e($post['category']) ?>"><?= e(category_label((string) $post['category'])) ?></span>
            <time datetime="<?= e(date('c', (int) $post['created_at'])) ?>"><?= e(tanggal_id((int) $post['created_at'])) ?></time>
          </p>

          <h1 class="article__title"><?= e($post['title']) ?></h1>

          <?php if (trim((string) $post['excerpt']) !== ''): ?>
            <p class="article__excerpt"><?= e($post['excerpt']) ?></p>
          <?php endif; ?>

          <?php $image = post_image_url($post); ?>
          <?php if ($image !== ''): ?>
            <figure class="article__media">
              <img src="<?= e($image) ?>" alt="<?= e($post['title']) ?>" fetchpriority="high">
            </figure>
          <?php endif; ?>

          <div class="article__body">
            <?= render_content((string) $post['content']) ?>
          </div>

          <p class="article__foot">
            <a class="btn btn--primary" href="<?= e($homeKontak) ?>">Hubungi sekolah</a>
            <a class="btn btn--ghost-dark" href="<?= e($homeBerita) ?>">Berita lainnya</a>
          </p>
        </div>
      </article>

      <?php if ($related): ?>
        <section class="section section--tint">
          <div class="container">
            <header class="section__head">
              <p class="eyebrow">Lainnya</p>
              <h2>Berita sekolah lainnya</h2>
            </header>
            <div class="news-grid">
              <?= implode('', array_map('render_post_card', $related)) ?>
            </div>
          </div>
        </section>
      <?php endif; ?>

    <?php else: ?>
      <section class="section">
        <div class="container">
          <header class="section__head">
            <p class="eyebrow">Kabar Sekolah</p>
            <h2>Berita, prestasi &amp; kegiatan</h2>
            <p class="section__lead">Kabar terbaru dari SMK Bintang Nusantara 2 — mulai dari kegiatan belajar, praktik jurusan, hingga prestasi siswa.</p>
          </header>

          <div class="chips" role="group" aria-label="Saring berita berdasarkan kategori">
            <?php $active = $category ?? ''; ?>
            <a class="chip <?= $active === '' ? 'is-active' : '' ?>" href="<?= e(url('berita.php')) ?>">Semua</a>
            <?php foreach (categories() as $key => $label): ?>
              <a class="chip <?= $active === $key ? 'is-active' : '' ?>" href="<?= e(url('berita.php?kategori=' . $key)) ?>"><?= e($label) ?></a>
            <?php endforeach; ?>
          </div>

          <?php if (!$posts): ?>
            <div class="news-empty">
              <strong>Belum ada kabar yang dipublikasikan.</strong>
              <p>Kabar sekolah akan tampil di sini setelah admin menambahkannya melalui panel admin.</p>
            </div>
          <?php else: ?>
            <div class="news-grid">
              <?= implode('', array_map('render_post_card', $posts)) ?>
            </div>
          <?php endif; ?>
        </div>
      </section>
    <?php endif; ?>
  </main>

  <footer class="page-footer">
    <div class="container page-footer__inner">
      <p>&copy; <?= date('Y') ?> SMK Bintang Nusantara 2 · NPSN 70009003</p>
      <nav aria-label="Tautan footer">
        <a href="<?= e($homeBeranda) ?>">Beranda</a>
        <a href="<?= e($homeBerita) ?>">Berita</a>
        <a href="<?= e($homeKontak) ?>">Kontak</a>
        <a href="<?= e(url('admin/login.php')) ?>">Admin</a>
      </nav>
    </div>
  </footer>
</body>
</html>
