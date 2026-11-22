<?php
/**
 * Halaman login admin.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

if (!is_installed()) {
    redirect('install.php');
}

if (is_logged_in()) {
    redirect('admin/index.php');
}

$error = '';
$username = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Username dan password wajib diisi.';
    } elseif (login_blocked($username)) {
        $error = 'Terlalu banyak percobaan gagal. Coba lagi dalam 10 menit.';
    } else {
        $stmt = db()->prepare('SELECT * FROM admins WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, (string) $admin['password_hash'])) {
            clear_login_failures($username);
            login_admin($admin);

            $target = $_SESSION['after_login'] ?? '';
            unset($_SESSION['after_login']);

            if (is_string($target) && strpos($target, 'admin/') === 0 && strpos($target, '//') === false) {
                redirect($target);
            }

            redirect('admin/index.php');
        }

        if ($admin) {
            record_login_failure($username);
        } else {
            // Tetap catat supaya tidak bisa menebak username tanpa batas.
            record_login_failure($username);
        }

        $error = 'Username atau password salah.';
    }
}

$flashes = take_flashes();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Login Admin — SMK Bintang Nusantara 2</title>
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
        <small>Panel Admin Sekolah</small>
      </span>
    </a>

    <h1>Masuk admin</h1>
    <p class="auth-sub">Kelola berita, prestasi, dan kegiatan sekolah.</p>

    <?php if ($error !== ''): ?>
      <div class="alert alert--error" style="margin-top:16px"><span><?= e($error) ?></span></div>
    <?php endif; ?>

    <?php foreach ($flashes as $item): ?>
      <div class="alert alert--<?= e($item['type'] === 'success' ? 'success' : ($item['type'] === 'error' ? 'error' : 'info')) ?>" style="margin-top:16px">
        <span><?= e($item['msg']) ?></span>
      </div>
    <?php endforeach; ?>

    <form class="auth-form" method="post" action="<?= e(url('admin/login.php')) ?>">
      <input type="hidden" name="_token" value="<?= e(csrf_token()) ?>">

      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" type="text" required autofocus autocomplete="username" value="<?= e($username) ?>">
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required autocomplete="current-password">
      </div>

      <button class="btn-auth" type="submit">Masuk</button>
    </form>

    <p class="auth-foot">
      <a href="<?= e(url('index.html')) ?>">← Kembali ke website</a>
      <span>Akses khusus pengelola sekolah</span>
    </p>
  </main>
</body>
</html>
