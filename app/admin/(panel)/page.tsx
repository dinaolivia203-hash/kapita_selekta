import { ConfirmButton } from "@/components/ConfirmButton";
import {
  buatExcerpt,
  formatTanggal,
  postImageUrl,
} from "@/lib/format";
import { findAllPosts } from "@/lib/posts";
import { categoryLabel } from "@/lib/types";

import { postAction } from "./actions";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  published: { type: "success", text: "Berita berhasil diterbitkan." },
  hidden: { type: "success", text: "Berita disembunyikan dari website." },
  deleted: { type: "success", text: "Berita telah dihapus." },
  saved: { type: "success", text: "Perubahan berita sudah disimpan." },
  created: { type: "success", text: "Berita baru berhasil disimpan." },
  notfound: { type: "error", text: "Berita tidak ditemukan." },
  unknown: { type: "error", text: "Aksi tidak dikenal." },
};

function resolveMessage(
  msg: string | undefined,
  error: string | undefined,
): { type: "success" | "error"; text: string } | null {
  const key = error || msg || "";

  return key && MESSAGES[key] ? MESSAGES[key] : null;
}

type SearchParams = Promise<{ msg?: string; error?: string }>;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const posts = await findAllPosts();
  const total = posts.length;
  const published = posts.filter((post) => post.is_published).length;
  const drafts = total - published;
  const message = resolveMessage(params.msg, params.error);

  return (
    <>
      <div className="admin-head">
        <div>
          <p>Panel Admin</p>
          <h1>Berita, prestasi &amp; kegiatan</h1>
        </div>
        <div className="admin-head__actions">
          <a className="btn-admin" href="/admin/post">
            + Tulis Berita
          </a>
        </div>
      </div>

      {message ? (
        <div className={`alert alert--${message.type}`} style={{ marginBottom: 16 }}>
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
        <div className="admin-stat">
          <span>Terbit</span>
          <strong>{published}</strong>
        </div>
        <div className="admin-stat">
          <span>Draf</span>
          <strong>{drafts}</strong>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2>Daftar berita</h2>
          <span>{total} tulisan</span>
        </div>

        {total === 0 ? (
          <div className="empty-state">
            <strong>Belum ada berita</strong>
            <p>
              Tulisan pertama akan tampil di tab Berita pada website sekolah.
            </p>
            <a className="btn-admin" href="/admin/post">
              Tulis berita pertama
            </a>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="posts-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const image = postImageUrl(post.image);

                  return (
                    <tr key={post.id}>
                      <td>
                        <div className="post-cell">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="post-cell__thumb"
                              src={image}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span
                              className="post-cell__thumb post-cell__thumb--empty"
                              aria-hidden="true"
                            >
                              {post.title.charAt(0)}
                            </span>
                          )}
                          <div>
                            <strong>{post.title}</strong>
                            <small>{buatExcerpt(post.excerpt, 70)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`cat-tag cat-tag--${post.category}`}>
                          {categoryLabel(post.category)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>
                        {formatTanggal(post.created_at)}
                      </td>
                      <td>
                        <span
                          className={`status ${
                            post.is_published ? "status--live" : "status--draft"
                          }`}
                        >
                          {post.is_published ? "Terbit" : "Draf"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <a
                            className="btn-admin btn-admin--light btn-admin--sm"
                            href={`/admin/post?id=${post.id}`}
                          >
                            Edit
                          </a>

                          <form action={postAction}>
                            <input type="hidden" name="id" value={post.id} />
                            <input type="hidden" name="action" value="toggle" />
                            <button
                              className="btn-admin btn-admin--light btn-admin--sm"
                              type="submit"
                            >
                              {post.is_published ? "Sembunyikan" : "Terbitkan"}
                            </button>
                          </form>

                          <form action={postAction}>
                            <input type="hidden" name="id" value={post.id} />
                            <input type="hidden" name="action" value="delete" />
                            <ConfirmButton
                              className="btn-admin btn-admin--danger btn-admin--sm"
                              message="Hapus berita ini? Tindakan ini tidak bisa dibatalkan."
                            >
                              Hapus
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
