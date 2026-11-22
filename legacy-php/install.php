<?php
/**
 * Pemasangan awal: membuat tabel database dan akun admin pertama.
 * Buka sekali setelah upload, lalu HAPUS file ini dari hosting.
 */

declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/schema.php';

$driver = (string) config('db.driver');

$errors = [];
$done = false;
$installed = is_installed();

$checks = [
    'PHP 7.4 atau lebih baru' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'Ekstensi PDO aktif' => extension_loaded('pdo'),
    'Driver database (pdo_' . $driver . ')' => extension_loaded('pdo_' . $driver),
    'Folder gambar dapat ditulis' => is_dir((string) config('uploads.dir')) && is_writable((string) config('uploads.dir')),
    'Folder storage dapat ditulis' => is_dir(APP_ROOT . '/storage') && is_writable(APP_ROOT . '/storage'),
];

$allChecksPassed = !in_array(false, $checks, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if ($installed) {
        $errors[] = 'Website sudah terpasang. Hapus file install.php dari hosting.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $username = trim((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $password2 = (string) ($_POST['password2'] ?? '');

        if (mb_strlen($name) < 3 || mb_strlen($name) > 100) {
            $errors[] = 'Nama admin harus 3–100 karakter.';
        }

        if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $username)) {
            $errors[] = 'Username 3–50 karakter, hanya huruf, angka, titik, garis bawah, atau strip.';
        }

        if (strlen($password) < 8) {
            $errors[] = 'Password minimal 8 karakter.';
        }

        if ($password !== $password2) {
            $errors[] = 'Konfirmasi password tidak sama.';
        }

        if (!$errors) {
            try {
                $pdo = db();
                install_schema($pdo, $driver);

                $count = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();

                if ($count > 0) {
                    $errors[] = 'Akun admin sudah ada. Hapus file install.php agar tidak dipakai ulang.';
                } else {
                    $now = time();
                    $stmt = $pdo->prepare(
                        'INSERT INTO admins (username, name, password_hash, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?)'
                    );
                    $stmt->execute([
                        $username,
                        $name,
                        password_hash($password, PASSWORD_DEFAULT),
                        $now,
                        $now,
                    ]);

                    if (!is_dir(APP_ROOT . '/storage')) {
                        @mkdir(APP_ROOT . '/storage', 0775, true);
                    }

                    @file_put_contents(
                        APP_ROOT . '/storage/installed.lock',
                        'Terpasang pada ' . date('Y-m-d H:i:s') . PHP_EOL
                    );

                    $done = true;
                    $installed = true;
                }
            } catch (Throwable $e) {
                $errors[] = 'Gagal membuat tabel: ' . $e->getMessage();
            }
        }
    }
}

$token = csrf_token();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Pasang Website — SMK Bintang Nusantara 2</title>
  <link rel="icon" type="image/png" href="<?= e(url('assets/img/logo.png')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('admin/admin.css')) ?>">
</head>
<body class="auth-body">
  <main class="auth-card">
    <a class="auth-brand" href="<?= e(url('index.html')) ?>">
      <img src="<?= e(url('assets/img/logo.png')) ?>" alt="">
      <span>
        <strong>SMK Bintang Nusantara 2</strong>
        <small>Panel Admin · Pemasangan Awal</small>
      </span>
    </a>

    <?php if ($done): ?>
      <h1>Website berhasil dipasang</h1>
      <p class="auth-sub">Akun admin sudah dibuat. Sekarang Anda bisa masuk dan mulai menulis berita sekolah.</p>
      <div style="margin-top:18px" class="alert alert--success">
        <span>Penting: hapus file <code>install.php</code> dari hosting setelah ini.</span>
      </div>
      <div class="auth-form">
        <a class="btn-auth" style="text-align:center;text-decoration:none;display:block" href="<?= e(url('admin/login.php')) ?>">Masuk ke Panel Admin</a>
      </div>
      <p class="auth-foot"><a href="<?= e(url('index.html')) ?>">← Lihat website</a><span>v1.0</span></p>
    <?php elseif ($installed): ?>
      <h1>Website sudah terpasang</h1>
      <p class="auth-sub">Tabel database dan akun admin sudah ada. File ini tidak perlu dijalankan lagi.</p>
      <div class="auth-form">
        <a class="btn-auth" style="text-align:center;text-decoration:none;display:block" href="<?= e(url('admin/login.php')) ?>">Masuk ke Panel Admin</a>
      </div>
      <div class="alert alert--info" style="margin-top:18px">
        <span>Demi keamanan, hapus <code>install.php</code> dari hosting.</span>
      </div>
    <?php else: ?>
      <h1>Pasang website</h1>
      <p class="auth-sub">Buat akun admin pertama untuk mengelola berita, prestasi, dan kegiatan sekolah.</p>

      <?php foreach ($errors as $error): ?>
        <div class="alert alert--error" style="margin-top:16px"><span><?= e($error) ?></span></div>
      <?php endforeach; ?>

      <?php if (!$allChecksPassed): ?>
        <div class="alert alert--error" style="margin-top:16px">
          <span>Beberapa persyaratan belum terpenuhi. Periksa daftar di bawah sebelum melanjutkan.</span>
        </div>
      <?php endif; ?>

      <form class="auth-form" method="post" action="<?= e(url('install.php')) ?>" autocomplete="off">
        <input type="hidden" name="_token" value="<?= e($token) ?>">

        <div class="field">
          <label for="name">Nama admin</label>
          <input id="name" name="name" type="text" placeholder="Contoh: Admin Sekolah" required maxlength="100" value="<?= e($_POST['name'] ?? '') ?>">
        </div>

        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" placeholder="adminsekolah" required minlength="3" maxlength="50" pattern="[A-Za-z0-9._\-]+" value="<?= e($_POST['username'] ?? '') ?>">
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Minimal 8 karakter" required minlength="8" autocomplete="new-password">
        </div>

        <div class="field">
          <label for="password2">Ulangi password</label>
          <input id="password2" name="password2" type="password" placeholder="Ketik ulang password" required minlength="8" autocomplete="new-password">
        </div>

        <button class="btn-auth" type="submit">Pasang sekarang</button>
      </form>

      <div class="setup-check">
        <?php foreach ($checks as $label => $ok): ?>
          <div>
            <span><?= e($label) ?></span>
            <span class="<?= $ok ? '' : 'is-bad' ?>"><?= $ok ? 'Siap' : 'Belum' ?></span>
          </div>
        <?php endforeach; ?>
        <div>
          <span>Database</span>
          <span><?= e(strtoupper($driver)) ?></span>
        </div>
      </div>

      <p class="auth-foot">
        <span>Sudah terpasang?</span>
        <a href="<?= e(url('admin/login.php')) ?>">Masuk di sini →</a>
      </p>
    <?php endif; ?>
  </main>
</body>
</html>
