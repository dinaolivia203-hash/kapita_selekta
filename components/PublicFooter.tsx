export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="page-footer">
      <div className="container page-footer__inner">
        <p>&copy; {year} SMK Bintang Nusantara 2 · NPSN 70009003</p>
        <nav aria-label="Tautan footer">
          <a href="/#beranda">Beranda</a>
          <a href="/#berita">Berita</a>
          <a href="/#kontak">Kontak</a>
          <a href="/admin/login">Admin</a>
        </nav>
      </div>
    </footer>
  );
}
