<?php
/**
 * Bootstrap aplikasi: konfigurasi, session, koneksi database, dan helper.
 * Semua halaman PHP (admin, API, berita) memuat file ini lebih dulu.
 */

declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));

$appConfig = require APP_ROOT . '/config.php';
$GLOBALS['app_config'] = $appConfig;

date_default_timezone_set($appConfig['site']['timezone'] ?? 'Asia/Jakarta');

if (!empty($appConfig['debug'])) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
}

/* -------------------------------------------------------------------------
   Base URL (mendukung hosting di subfolder, mis. /smk)
   ------------------------------------------------------------------------- */
$basePath = $appConfig['base_path'] ?? null;

if ($basePath === null) {
    $basePath = '';
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;
    $appRoot = realpath(APP_ROOT);

    if ($docRoot && $appRoot) {
        $docRoot = rtrim(str_replace('\\', '/', $docRoot), '/');
        $appRoot = str_replace('\\', '/', $appRoot);

        if (stripos($appRoot, $docRoot) === 0) {
            $basePath = substr($appRoot, strlen($docRoot));
        }
    }
}

define('BASE_URL', rtrim(str_replace('\\', '/', (string) $basePath), '/'));

/* -------------------------------------------------------------------------
   Session
   ------------------------------------------------------------------------- */
if (PHP_SAPI !== 'cli' && session_status() === PHP_SESSION_NONE) {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => BASE_URL === '' ? '/' : BASE_URL . '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('smkbinus2_admin');
    session_start();
}

/* -------------------------------------------------------------------------
   Konfigurasi & database
   ------------------------------------------------------------------------- */
function config(?string $key = null)
{
    $cfg = $GLOBALS['app_config'];

    if ($key === null) {
        return $cfg;
    }

    foreach (explode('.', $key) as $part) {
        if (!is_array($cfg) || !array_key_exists($part, $cfg)) {
            return null;
        }
        $cfg = $cfg[$part];
    }

    return $cfg;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = config('db');

    try {
        if (($db['driver'] ?? 'mysql') === 'sqlite') {
            $path = getenv('APP_SQLITE_PATH') ?: $db['sqlite'];
            $dir = dirname($path);

            if (!is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }

            $pdo = new PDO('sqlite:' . $path);
            $pdo->exec('PRAGMA journal_mode = WAL');
        } else {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $db['host'],
                (int) $db['port'],
                $db['name'],
                $db['charset'] ?: 'utf8mb4'
            );
            $pdo = new PDO($dsn, (string) $db['user'], (string) $db['pass']);
        }

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    } catch (PDOException $e) {
        db_failure_page($e);
    }

    return $pdo;
}

function db_failure_page(PDOException $e): void
{
    http_response_code(500);
    $detail = !empty($GLOBALS['app_config']['debug']) ? e($e->getMessage()) : '';

    echo '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>Database belum terhubung</title>';
    echo '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06122e;color:#eef4ff;font-family:system-ui,sans-serif;padding:24px}'
        . 'div{max-width:560px;background:#0c2255;border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:28px;line-height:1.65}'
        . 'h1{margin:0 0 10px;font-size:20px}code{background:rgba(255,255,255,.12);padding:2px 6px;border-radius:6px}'
        . 'p{margin:8px 0;color:#c3d3f2;font-size:14px}</style></head><body><div>';
    echo '<h1>Database belum terhubung</h1>';
    echo '<p>Periksa kembali nama database, username, dan password pada <code>config.php</code> sesuai data di cPanel.</p>';
    echo '<p>Jika website baru di-upload, buka <code>install.php</code> untuk membuat tabel dan akun admin.</p>';

    if ($detail !== '') {
        echo '<p><strong>Detail:</strong> ' . $detail . '</p>';
    }

    echo '</div></body></html>';
    exit;
}

/* -------------------------------------------------------------------------
   Helper umum
   ------------------------------------------------------------------------- */
function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function url(string $path = ''): string
{
    if (preg_match('~^https?://~i', $path)) {
        return $path;
    }

    if ($path === '') {
        return BASE_URL === '' ? '/' : BASE_URL . '/';
    }

    return BASE_URL . '/' . ltrim($path, '/');
}

function redirect(string $path): void
{
    if (!headers_sent()) {
        header('Location: ' . url($path));
    }
    exit;
}

function flash(string $type, string $message): void
{
    if (!isset($_SESSION['flash']) || !is_array($_SESSION['flash'])) {
        $_SESSION['flash'] = [];
    }
    $_SESSION['flash'][] = ['type' => $type, 'msg' => $message];
}

function take_flashes(): array
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);

    return is_array($flashes) ? $flashes : [];
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="' . e(csrf_token()) . '">';
}

function csrf_verify(): void
{
    $token = $_POST['_token'] ?? '';

    if (!is_string($token) || $token === '' || !hash_equals(csrf_token(), $token)) {
        http_response_code(400);
        exit('Sesi formulir sudah kedaluwarsa. Muat ulang halaman lalu coba lagi.');
    }
}

/* -------------------------------------------------------------------------
   Login admin & pembatasan percobaan
   ------------------------------------------------------------------------- */
function is_installed(): bool
{
    return file_exists(APP_ROOT . '/storage/installed.lock');
}

function current_admin(): ?array
{
    return isset($_SESSION['admin']) && is_array($_SESSION['admin']) ? $_SESSION['admin'] : null;
}

function is_logged_in(): bool
{
    return current_admin() !== null;
}

function require_admin(): void
{
    if (is_logged_in()) {
        return;
    }

    $target = $_SERVER['REQUEST_URI'] ?? '';
    $target = str_replace(BASE_URL, '', $target);

    if ($target !== '' && strpos($target, 'admin/') === 0) {
        $_SESSION['after_login'] = ltrim($target, '/');
    }

    redirect('admin/login.php');
}

function login_admin(array $admin): void
{
    session_regenerate_id(true);
    $_SESSION['admin'] = [
        'id'       => (int) $admin['id'],
        'username' => (string) $admin['username'],
        'name'     => (string) $admin['name'],
    ];
}

function logout_admin(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
    }

    session_destroy();
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function login_blocked(string $username): bool
{
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM login_attempts WHERE attempted_at > ? AND (username = ? OR ip = ?)'
    );
    $stmt->execute([time() - 600, $username, client_ip()]);

    return (int) $stmt->fetchColumn() >= 5;
}

function record_login_failure(string $username): void
{
    $pdo = db();
    $pdo->prepare('INSERT INTO login_attempts (username, ip, attempted_at) VALUES (?, ?, ?)')
        ->execute([mb_substr($username, 0, 80), client_ip(), time()]);

    $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < ?')->execute([time() - 86400]);
}

function clear_login_failures(string $username): void
{
    db()->prepare('DELETE FROM login_attempts WHERE username = ? OR ip = ?')
        ->execute([$username, client_ip()]);
}

/* -------------------------------------------------------------------------
   Konten berita
   ------------------------------------------------------------------------- */
function categories(): array
{
    return [
        'berita'   => 'Berita',
        'prestasi' => 'Prestasi',
        'kegiatan' => 'Kegiatan',
    ];
}

function category_label(string $key): string
{
    $all = categories();

    return $all[$key] ?? 'Berita';
}

function slugify(string $text): string
{
    $text = trim(strip_tags($text));

    if (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT', $text);
        if ($converted !== false) {
            $text = $converted;
        }
    }

    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    $text = trim($text, '-');

    if ($text === '') {
        $text = 'berita';
    }

    return substr($text, 0, 160);
}

function unique_slug(string $slug, int $ignoreId = 0): string
{
    $base = $slug;
    $number = 2;

    while (true) {
        $stmt = db()->prepare('SELECT COUNT(*) FROM posts WHERE slug = ? AND id <> ?');
        $stmt->execute([$slug, $ignoreId]);

        if ((int) $stmt->fetchColumn() === 0) {
            return $slug;
        }

        $slug = $base . '-' . $number;
        $number++;
    }
}

function buat_excerpt(string $text, int $limit = 170): string
{
    $text = preg_replace('/\s+/', ' ', strip_tags($text)) ?? '';
    $text = trim($text);

    if (mb_strlen($text) <= $limit) {
        return $text;
    }

    return rtrim(mb_substr($text, 0, $limit - 1)) . '…';
}

function render_content(string $text): string
{
    $text = str_replace(["\r\n", "\r"], "\n", trim($text));

    if ($text === '') {
        return '';
    }

    $paragraphs = preg_split('/\n{2,}/', $text) ?: [];
    $html = '';

    foreach ($paragraphs as $paragraph) {
        $paragraph = trim($paragraph);
        if ($paragraph === '') {
            continue;
        }
        $html .= '<p>' . nl2br(e($paragraph), false) . '</p>';
    }

    return $html;
}

function post_url(array $post): string
{
    return url('berita.php?slug=' . rawurlencode((string) $post['slug']));
}

function post_image_url(array $post): string
{
    $image = trim((string) ($post['image'] ?? ''));

    return $image === '' ? '' : url(config('uploads.url') . '/' . $image);
}

function find_posts(string $category = '', int $limit = 9, bool $onlyPublished = true): array
{
    $sql = 'SELECT * FROM posts';
    $where = [];
    $params = [];

    if ($onlyPublished) {
        $where[] = 'is_published = 1';
    }

    if ($category !== '') {
        $where[] = 'category = ?';
        $params[] = $category;
    }

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ORDER BY created_at DESC, id DESC LIMIT ' . max(1, min(60, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function find_post_by_slug(string $slug): ?array
{
    $stmt = db()->prepare('SELECT * FROM posts WHERE slug = ? AND is_published = 1 LIMIT 1');
    $stmt->execute([$slug]);
    $post = $stmt->fetch();

    return $post ?: null;
}

function tanggal_id(int $timestamp): string
{
    static $bulan = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    return date('j', $timestamp) . ' ' . $bulan[(int) date('n', $timestamp)] . ' ' . date('Y', $timestamp);
}

function render_post_card(array $post): string
{
    $link = post_url($post);
    $image = post_image_url($post);
    $category = (string) $post['category'];
    $label = category_label($category);
    $title = (string) $post['title'];
    $initial = mb_strtoupper(mb_substr($label, 0, 1));

    $media = $image !== ''
        ? '<img src="' . e($image) . '" alt="" loading="lazy">'
        : '<span class="news-card__placeholder" aria-hidden="true">' . e($initial) . '</span>';

    return '<article class="news-card">'
        . '<a class="news-card__media" href="' . e($link) . '" tabindex="-1" aria-hidden="true">'
        . $media
        . '<span class="news-card__badge badge--' . e($category) . '">' . e($label) . '</span>'
        . '</a>'
        . '<div class="news-card__body">'
        . '<p class="news-card__date"><time datetime="' . e(date('c', (int) $post['created_at'])) . '">' . e(tanggal_id((int) $post['created_at'])) . '</time></p>'
        . '<h3><a href="' . e($link) . '">' . e($title) . '</a></h3>'
        . '<p class="news-card__excerpt">' . e((string) $post['excerpt']) . '</p>'
        . '<a class="link" href="' . e($link) . '">Baca selengkapnya <span aria-hidden="true">→</span></a>'
        . '</div>'
        . '</article>';
}

/* -------------------------------------------------------------------------
   Upload gambar
   ------------------------------------------------------------------------- */
function simpan_gambar(array $file, ?string &$error = null): ?string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        $error = 'Gambar gagal diunggah. Coba pilih ulang file.';
        return null;
    }

    $maxSize = (int) config('uploads.max_size');
    if (($file['size'] ?? 0) > $maxSize) {
        $error = 'Ukuran gambar terlalu besar (maksimal ' . round($maxSize / 1024 / 1024) . ' MB).';
        return null;
    }

    $info = @getimagesize($file['tmp_name'] ?? '');
    if (!$info) {
        $error = 'File yang dipilih bukan gambar yang valid.';
        return null;
    }

    $allowed = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG  => 'png',
        IMAGETYPE_WEBP => 'webp',
    ];

    if (!isset($allowed[$info[2]])) {
        $error = 'Format gambar harus JPG, PNG, atau WEBP.';
        return null;
    }

    $dir = (string) config('uploads.dir');
    if (!is_dir($dir) && !@mkdir($dir, 0775, true)) {
        $error = 'Folder gambar tidak dapat dibuat. Periksa izin folder assets/img.';
        return null;
    }

    $filename = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$info[2]];
    $target = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        $error = 'Gambar gagal disimpan di server.';
        return null;
    }

    @chmod($target, 0644);
    optimalkan_gambar($target);

    return $filename;
}

function optimalkan_gambar(string $path): void
{
    if (!function_exists('imagecreatetruecolor')) {
        return;
    }

    $info = @getimagesize($path);
    if (!$info) {
        return;
    }

    [$width, $height] = $info;

    if ($width <= 1600) {
        return;
    }

    $newWidth = 1600;
    $newHeight = (int) round($height * ($newWidth / $width));

    $source = null;
    switch ($info[2]) {
        case IMAGETYPE_JPEG:
            $source = @imagecreatefromjpeg($path);
            break;
        case IMAGETYPE_PNG:
            $source = @imagecreatefrompng($path);
            break;
        case IMAGETYPE_WEBP:
            $source = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null;
            break;
    }

    if (!$source) {
        return;
    }

    $canvas = imagecreatetruecolor($newWidth, $newHeight);

    if ($info[2] !== IMAGETYPE_JPEG) {
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
    }

    imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    switch ($info[2]) {
        case IMAGETYPE_JPEG:
            @imagejpeg($canvas, $path, 82);
            break;
        case IMAGETYPE_PNG:
            @imagepng($canvas, $path, 7);
            break;
        case IMAGETYPE_WEBP:
            if (function_exists('imagewebp')) {
                @imagewebp($canvas, $path, 82);
            }
            break;
    }

    imagedestroy($source);
    imagedestroy($canvas);
}

function hapus_gambar(string $filename): void
{
    $filename = basename($filename);

    if ($filename === '') {
        return;
    }

    $path = rtrim((string) config('uploads.dir'), '/\\') . DIRECTORY_SEPARATOR . $filename;

    if (is_file($path)) {
        @unlink($path);
    }
}
