<?php
/**
 * Keluar dari panel admin (POST + CSRF).
 */

declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('admin/index.php');
}

csrf_verify();

// Kosongkan data login, tetapi pertahankan session untuk pesan singkat.
unset($_SESSION['admin']);
session_regenerate_id(true);
flash('success', 'Anda telah keluar dari panel admin.');

redirect('admin/login.php');
