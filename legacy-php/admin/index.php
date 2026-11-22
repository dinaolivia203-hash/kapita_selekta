<?php
/**
 * Dashboard admin: daftar berita, prestasi, dan kegiatan sekolah.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';
require_admin();

/* -------------------------------------------------------------------------
   Aksi: ubah status terbit / hapus
   ------------------------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $id = (int) ($_POST['id'] ?? 0);
    $action = (string) ($_POST['action'] ?? '');

    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $post = $stmt->fetch();

    if (!$post) {
        flash('error', 'Berita tidak ditemukan.');
    } elseif ($action === 'toggle') {
        db()->prepare('UPDATE posts SET is_published = ?, updated_at = ? WHERE id = ?')
            ->execute([$post['is_published'] ? 0 : 1, time(), $id]);

        flash('success', $post['is_published'] ? 'Berita disembunyikan dari website.' : 'Berita berhasil diterbitkan.');
    } elseif ($action === 'delete') {
        if (!empty($post['image'])) {
            hapus_gambar((string) $post['image']);
        }

        db()->prepare('DELETE FROM posts WHERE id = ?')->execute([$id]);
        flash('success', 'Berita "' . $post['title'] . '" telah dihapus.');
    } else {
        flash('error', 'Aksi tidak dikenal.');
    }

    redirect('admin/index.php');
}

$posts = db()->query('SELECT * FROM posts ORDER BY created_at DESC, id DESC')->fetchAll();

$total = count($posts);
$published = 0;

foreach ($posts as $post) {
    if ((int) $post['is_published'] === 1) {
        $published++;
    }
}

$drafts = $total - $published;

$pageTitle = 'Berita Sekolah';
$activeNav = 'posts';
require __DIR__ . '/partials/header.php';
?>
      <div class="admin-head">
        <div>
          <p>Panel Admin</p>
          <h1>Berita, prestasi &amp; kegiatan</h1>
        </div>
        <div class="admin-head__actions">
          <a class="btn-admin" href="<?= e(url('admin/post.php')) ?>">+ Tulis Berita</a>
        </div>
      </div>

      <div class="admin-stats">
        <div class="admin-stat">
          <span>Total</span>
          <strong><?= $total ?></strong>
        </div>
        <div class="admin-stat">
          <span>Terbit</span>
          <strong><?= $published ?></strong>
        </div>
        <div class="admin-stat">
          <span>Draf</span>
          <strong><?= $drafts ?></strong>
        </div>
      </div>

      <section class="admin-card">
        <div class="admin-card__head">
          <h2>Daftar berita</h2>
          <span><?= $total ?> tulisan</span>
        </div>

        <?php if (!$posts): ?>
          <div class="empty-state">
            <strong>Belum ada berita</strong>
            <p>Tulisan pertama akan tampil di tab Berita pada website sekolah.</p>
            <a class="btn-admin" href="<?= e(url('admin/post.php')) ?>">Tulis berita pertama</a>
          </div>
        <?php else: ?>
          <div class="table-wrap">
            <table class="posts-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style="text-align:right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($posts as $post): ?>
                  <tr>
                    <td>
                      <div class="post-cell">
                        <?php $image = post_image_url($post); ?>
                        <?php if ($image !== ''): ?>
                          <img class="post-cell__thumb" src="<?= e($image) ?>" alt="" loading="lazy">
                        <?php else: ?>
                          <span class="post-cell__thumb post-cell__thumb--empty" aria-hidden="true"><?= e(mb_substr((string) $post['title'], 0, 1)) ?></span>
                        <?php endif; ?>
                        <div>
                          <strong><?= e($post['title']) ?></strong>
                          <small><?= e(buat_excerpt((string) $post['excerpt'], 70)) ?></small>
                        </div>
                      </div>
                    </td>
                    <td><span class="cat-tag cat-tag--<?= e($post['category']) ?>"><?= e(category_label((string) $post['category'])) ?></span></td>
                    <td style="white-space:nowrap;color:var(--muted)"><?= e(tanggal_id((int) $post['created_at'])) ?></td>
                    <td>
                      <span class="status <?= $post['is_published'] ? 'status--live' : 'status--draft' ?>">
                        <?= $post['is_published'] ? 'Terbit' : 'Draf' ?>
                      </span>
                    </td>
                    <td>
                      <div class="row-actions">
                        <a class="btn-admin btn-admin--light btn-admin--sm" href="<?= e(url('admin/post.php?id=' . (int) $post['id'])) ?>">Edit</a>

                        <form method="post" action="<?= e(url('admin/index.php')) ?>">
                          <?= csrf_field() ?>
                          <input type="hidden" name="id" value="<?= (int) $post['id'] ?>">
                          <input type="hidden" name="action" value="toggle">
                          <button class="btn-admin btn-admin--light btn-admin--sm" type="submit">
                            <?= $post['is_published'] ? 'Sembunyikan' : 'Terbitkan' ?>
                          </button>
                        </form>

                        <form method="post" action="<?= e(url('admin/index.php')) ?>" onsubmit="return confirm('Hapus berita ini? Tindakan ini tidak bisa dibatalkan.');">
                          <?= csrf_field() ?>
                          <input type="hidden" name="id" value="<?= (int) $post['id'] ?>">
                          <input type="hidden" name="action" value="delete">
                          <button class="btn-admin btn-admin--danger btn-admin--sm" type="submit">Hapus</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </section>
<?php require __DIR__ . '/partials/footer.php'; ?>
