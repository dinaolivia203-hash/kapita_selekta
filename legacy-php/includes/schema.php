<?php
/**
 * Pembuatan tabel database. Dipanggil dari install.php.
 * Mendukung MySQL (cPanel) dan SQLite (uji lokal).
 */

declare(strict_types=1);

function install_schema(PDO $pdo, string $driver): void
{
    if ($driver === 'sqlite') {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )'
        );

        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                excerpt TEXT NOT NULL DEFAULT \'\',
                content TEXT NOT NULL,
                image TEXT DEFAULT NULL,
                is_published INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )'
        );

        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                ip TEXT NOT NULL,
                attempted_at INTEGER NOT NULL
            )'
        );

        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (is_published, created_at)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attempts_time ON login_attempts (attempted_at)');

        return;
    }

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS admins (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at INT UNSIGNED NOT NULL,
            updated_at INT UNSIGNED NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_admins_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS posts (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(180) NOT NULL,
            slug VARCHAR(200) NOT NULL,
            category VARCHAR(20) NOT NULL,
            excerpt VARCHAR(320) NOT NULL DEFAULT \'\',
            content MEDIUMTEXT NOT NULL,
            image VARCHAR(255) DEFAULT NULL,
            is_published TINYINT(1) NOT NULL DEFAULT 1,
            created_at INT UNSIGNED NOT NULL,
            updated_at INT UNSIGNED NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_posts_slug (slug),
            KEY idx_posts_published (is_published, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS login_attempts (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(80) NOT NULL,
            ip VARCHAR(45) NOT NULL,
            attempted_at INT UNSIGNED NOT NULL,
            PRIMARY KEY (id),
            KEY idx_attempts_time (attempted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}
