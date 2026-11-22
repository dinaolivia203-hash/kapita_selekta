<?php
/**
 * API daftar berita untuk tab Berita di halaman utama.
 * GET /api/posts.php?kategori=prestasi&limit=9
 */

declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$category = strtolower(trim((string) ($_GET['kategori'] ?? '')));
if ($category !== '' && !array_key_exists($category, categories())) {
    $category = '';
}

$limit = (int) ($_GET['limit'] ?? 9);
$limit = max(1, min(24, $limit));

try {
    $posts = find_posts($category, $limit);
    $items = [];

    foreach ($posts as $post) {
        $items[] = [
            'id'             => (int) $post['id'],
            'title'          => (string) $post['title'],
            'slug'           => (string) $post['slug'],
            'category'       => (string) $post['category'],
            'category_label' => category_label((string) $post['category']),
            'excerpt'        => (string) $post['excerpt'],
            'image'          => post_image_url($post),
            'date'           => tanggal_id((int) $post['created_at']),
            'date_iso'       => date('c', (int) $post['created_at']),
            'url'            => post_url($post),
        ];
    }

    echo json_encode([
        'items'    => $items,
        'category' => $category,
        'count'    => count($items),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'items' => [],
        'count' => 0,
        'error' => 'server',
    ]);
}
