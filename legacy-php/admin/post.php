<?php
/**
 * Tambah / edit berita sekolah.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';
require_admin();

$id = (int) ($_GET['id'] ?? 0);
$editing = $id > 0;

$post = [
    'id'           => 0,
    'title'        => '',
    'category'     => 'berita',
    'excerpt'      => '',
    'content'      => '',
    'image'        => null,
    'is_published' => 1,
];

if ($editing) {
    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $found = $stmt->fetch();

    if (!$found) {
        flash('error', 'Berita yang ingin diedit tidak ditemukan.');
        redirect('admin/index.php');
    }

    $post = $found;
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $title = trim((string) ($_POST['title'] ?? ''));
    $category = (string) ($_POST['category'] ?? 'berita');
    $excerpt = trim((string) ($_POST['excerpt'] ?? ''));
    $content = trim((string) ($_POST['content'] ?? ''));
    $published = !empty($_POST['is_published']) ? 1 : 0;

    if (mb_strlen($title) < 3) {
        $errors[] = 'Judul minimal 3 karakter.';
    } elseif (mb_strlen($title) > 180) {
        $errors[] = 'Judul maksimal 180 karakter.';
    }

    if (!array_key_exists($category, categories())) {
        $errors[] = 'Kategori tidak valid.';
    }

    if (mb_strlen($content) < 10) {
        $errors[] = 'Isi berita minimal 10 karakter.';
    }

    if (mb_strlen($excerpt) > 320) {
        $errors[] = 'Ringkasan maksimal 320 karakter.';
    }

    // Simpan nilai isian supaya tidak hilang saat ada error.
    $post['title'] = $title;
    $post['category'] = $category;
    $post['excerpt'] = $excerpt;
    $post['content'] = $content;
    $post['is_published'] = $published;

    if (!$errors) {
        $image = $post['image'];

        $uploadError = null;
        $newImage = simpan_gambar($_FILES['image'] ?? [], $uploadError);

        if ($uploadError !== null) {
            $errors[] = $uploadError;
        }

        if ($newImage !== null) {
            if (!empty($image)) {
                hapus_gambar((string) $image);
            }
            $image = $newImage;
        } elseif (!empty($_POST['remove_image']) && !empty($image)) {
            hapus_gambar((string) $image);
            $image = null;
        }

        if (!$errors) {
            if ($excerpt === '') {
                $excerpt = buat_excerpt($content, 200);
            }

            $now = time();

            if ($editing) {
                $stmt = db()->prepare(
                    'UPDATE posts SET title = ?, category = ?, excerpt = ?, content = ?, image = ?, is_published = ?, updated_at = ?
                     WHERE id = ?'
                );
                $stmt->execute([$title, $category, $excerpt, $content, $image, $published, $now, $id]);
            } else {
                $slug = unique_slug(slugify($title));

                $stmt = db()->prepare(
                    'INSERT INTO posts (title, slug, category, excerpt, content, image, is_published, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([$title, $slug, $category, $excerpt, $content, $image, $published, $now, $now]);
            }

            flash('success', $editing ? 'Perubahan berita sudah disimpan.' : 'Berita baru berhasil disimpan.');
            redirect('admin/index.php');
        }

        $post['image'] = $image;
    }
}

$currentImage = !empty($post['image']) ? post_image_url($post) : '';

$pageTitle = $editing ? 'Edit Berita' : 'Tulis Berita';
$activeNav = $editing ? 'edit' : 'new';
require __DIR__ . '/partials/header.php';
?>
      <div class="admin-head">
        <div>
          <p><?= $editing ? 'Edit' : 'Tulis Baru' ?></p>
          <h1><?= $editing ? 'Edit berita' : 'Tulis berita sekolah' ?></h1>
        </div>
        <div class="admin-head__actions">
          <a class="btn-admin btn-admin--light" href="<?= e(url('admin/index.php')) ?>">← Daftar berita</a>
          <?php if ($editing && (int) $post['is_published'] === 1): ?>
            <a class="btn-admin btn-admin--light" href="<?= e(post_url($post)) ?>" target="_blank" rel="noopener">Lihat di situs ↗</a>
          <?php endif; ?>
        </div>
      </div>

      <?php foreach ($errors as $error): ?>
        <div class="alert alert--error" style="margin-bottom:16px"><span><?= e($error) ?></span></div>
      <?php endforeach; ?>

      <form class="admin-form" method="post" enctype="multipart/form-data" action="<?= e(url('admin/post.php?id=' . ($editing ? $id : 0))) ?>">
        <?= csrf_field() ?>
        <input type="hidden" name="id" value="<?= $editing ? (int) $id : 0 ?>">

        <div class="admin-panel">
          <h2>Isi berita</h2>

          <div class="field field--light">
            <label for="title">Judul</label>
            <input id="title" name="title" type="text" required maxlength="180" placeholder="Contoh: Siswa TSM mengikuti praktik servis mesin" value="<?= e($post['title']) ?>">
          </div>

          <div class="field field--light">
            <label for="content">Isi berita</label>
            <textarea id="content" name="content" required placeholder="Tulis berita selengkapnya di sini.&#10;&#10;Pisahkan antarparagraf dengan satu baris kosong."><?= e($post['content']) ?></textarea>
            <span class="field__hint">Baris kosong akan menjadi paragraf baru.</span>
          </div>

          <div class="field field--light">
            <label for="excerpt">Ringkasan (opsional)</label>
            <textarea id="excerpt" name="excerpt" maxlength="320" style="min-height:96px" placeholder="Ringkasan singkat yang tampil di kartu berita."><?= e($post['excerpt']) ?></textarea>
            <span class="field__hint">Kosongkan untuk mengambil otomatis dari isi berita.</span>
          </div>
        </div>

        <div style="display:grid;gap:18px">
          <div class="admin-panel">
            <h2>Publikasi</h2>

            <div class="field field--light">
              <label for="category">Kategori</label>
              <select id="category" name="category">
                <?php foreach (categories() as $key => $label): ?>
                  <option value="<?= e($key) ?>" <?= $post['category'] === $key ? 'selected' : '' ?>><?= e($label) ?></option>
                <?php endforeach; ?>
              </select>
            </div>

            <label class="checkbox">
              <input type="checkbox" name="is_published" value="1" <?= (int) $post['is_published'] === 1 ? 'checked' : '' ?>>
              <span>
                Terbitkan di website
                <small>Jika tidak dicentang, berita disimpan sebagai draf.</small>
              </span>
            </label>
          </div>

          <div class="admin-panel">
            <h2>Gambar utama</h2>

            <?php if ($currentImage !== ''): ?>
              <div class="image-preview">
                <img src="<?= e($currentImage) ?>" alt="Gambar saat ini">
                <p>Gambar saat ini. Unggah gambar baru untuk menggantinya.</p>
              </div>
              <label class="checkbox">
                <input type="checkbox" name="remove_image" value="1">
                <span>Hapus gambar ini</span>
              </label>
            <?php endif; ?>

            <div class="field field--light">
              <label for="image"><?= $currentImage !== '' ? 'Ganti gambar' : 'Unggah gambar' ?></label>
              <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp">
              <span class="field__hint">JPG, PNG, atau WEBP. Maksimal 6 MB. Gambar besar otomatis diperkecil.</span>
            </div>

            <div class="form-actions">
              <button class="btn-admin" type="submit"><?= $editing ? 'Simpan perubahan' : 'Simpan berita' ?></button>
              <a class="btn-admin btn-admin--light" href="<?= e(url('admin/index.php')) ?>">Batal</a>
            </div>
          </div>

          <div class="admin-panel">
            <h2>Tips</h2>
            <ul class="helper-list">
              <li>Gunakan judul yang singkat dan jelas.</li>
              <li>Pilih kategori <strong>Prestasi</strong> untuk lomba atau penghargaan.</li>
              <li>Pilih <strong>Kegiatan</strong> untuk acara sekolah.</li>
              <li>Ukuran gambar ideal 1600 × 900 piksel.</li>
            </ul>
          </div>
        </div>
      </form>
<?php require __DIR__ . '/partials/footer.php'; ?>
