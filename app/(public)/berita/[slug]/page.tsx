import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/PostCard";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import {
  formatTanggal,
  postImageUrl,
  splitParagraphs,
} from "@/lib/format";
import { findPostBySlug, findPosts } from "@/lib/posts";
import { categoryLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadPost(slug: string) {
  return findPostBySlug(decodeURIComponent(slug));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) {
    return { title: "Berita tidak ditemukan — SMK Bintang Nusantara 2" };
  }

  return {
    title: `${post.title} — SMK Bintang Nusantara 2`,
    description: post.excerpt,
  };
}

export default async function BeritaDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) {
    notFound();
  }

  const related = (await findPosts("", 6))
    .filter((candidate) => candidate.id !== post.id)
    .slice(0, 3);

  const image = postImageUrl(post.image);

  return (
    <>
      <PublicHeader />

      <main id="konten" className="page-main">
        <article className="section">
          <div className="container article__container">
            <a className="article__back" href="/#berita">
              ← Kembali ke Berita
            </a>

            <p className="article__meta">
              <span className={`badge badge--${post.category}`}>
                {categoryLabel(post.category)}
              </span>
              <time dateTime={new Date(post.created_at).toISOString()}>
                {formatTanggal(post.created_at)}
              </time>
            </p>

            <h1 className="article__title">{post.title}</h1>

            {post.excerpt.trim() !== "" ? (
              <p className="article__excerpt">{post.excerpt}</p>
            ) : null}

            {image ? (
              <figure className="article__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={post.title} fetchPriority="high" />
              </figure>
            ) : null}

            <div className="article__body">
              {splitParagraphs(post.content).map((paragraph, index) => (
                <p key={index}>
                  {paragraph.split("\n").map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {lineIndex > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>

            <p className="article__foot">
              <a className="btn btn--primary" href="/#kontak">
                Hubungi sekolah
              </a>
              <a className="btn btn--ghost-dark" href="/#berita">
                Berita lainnya
              </a>
            </p>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="section section--tint">
            <div className="container">
              <header className="section__head">
                <p className="eyebrow">Lainnya</p>
                <h2>Berita sekolah lainnya</h2>
              </header>
              <div className="news-grid">
                {related.map((item) => (
                  <PostCard key={item.id} post={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <PublicFooter />
    </>
  );
}
