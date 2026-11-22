import type { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { normalizeCategory } from "@/lib/format";
import { findPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berita, Prestasi & Kegiatan — SMK Bintang Nusantara 2",
  description:
    "Kabar terbaru, prestasi siswa, dan kegiatan SMK Bintang Nusantara 2, Tanjungbintang, Lampung Selatan.",
};

type SearchParams = Promise<{ kategori?: string | string[] }>;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.kategori)
    ? params.kategori[0]
    : params.kategori;
  const category = normalizeCategory(raw || "");
  const posts = await findPosts(category, 24);

  return (
    <>
      <PublicHeader />

      <main id="konten" className="page-main">
        <section className="section">
          <div className="container">
            <header className="section__head">
              <p className="eyebrow">Kabar Sekolah</p>
              <h2>Berita, prestasi &amp; kegiatan</h2>
              <p className="section__lead">
                Kabar terbaru dari SMK Bintang Nusantara 2 — mulai dari kegiatan
                belajar, praktik jurusan, hingga prestasi siswa.
              </p>
            </header>

            <div
              className="chips"
              role="group"
              aria-label="Saring berita berdasarkan kategori"
            >
              <a className={`chip ${category === "" ? "is-active" : ""}`} href="/berita">
                Semua
              </a>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <a
                  key={key}
                  className={`chip ${category === key ? "is-active" : ""}`}
                  href={`/berita?kategori=${key}`}
                >
                  {label}
                </a>
              ))}
            </div>

            {posts.length === 0 ? (
              <div className="news-empty">
                <strong>Belum ada kabar yang dipublikasikan.</strong>
                <p>
                  Kabar sekolah akan tampil di sini setelah admin menambahkannya
                  melalui panel admin.
                </p>
              </div>
            ) : (
              <div className="news-grid">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
