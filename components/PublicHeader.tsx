export function PublicHeader() {
  return (
    <>
      <a className="skip-link" href="#konten">
        Langsung ke konten
      </a>

      <header className="page-header">
        <div className="container page-header__inner">
          <a className="brand" href="/#beranda">
            <img
              className="brand__logo"
              src="/assets/img/logo.png"
              alt="Logo SMK Bintang Nusantara 2"
              width={44}
              height={44}
            />
            <span className="brand__text">
              <strong>SMK BINTANG NUSANTARA 2</strong>
              <small>Tanjungbintang · Lampung Selatan</small>
            </span>
          </a>

          <nav className="page-header__nav" aria-label="Navigasi halaman">
            <a href="/#beranda">Beranda</a>
            <a href="/#berita">Berita</a>
            <a href="/#kontak">Kontak</a>
          </nav>
        </div>
      </header>
    </>
  );
}
