import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function NotFound() {
  return (
    <>
      <link rel="icon" type="image/png" href="/assets/img/logo.png" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/assets/css/style.css" />

      <PublicHeader />

      <main id="konten" className="page-main">
        <section className="section">
          <div className="container article__container">
            <p className="eyebrow">404</p>
            <h1 className="article__title">Halaman tidak ditemukan</h1>
            <p className="article__excerpt">
              Tulisan ini mungkin sudah dihapus atau alamatnya berubah.
            </p>
            <p style={{ marginTop: 22 }}>
              <a className="btn btn--primary" href="/berita">
                Lihat semua berita
              </a>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
