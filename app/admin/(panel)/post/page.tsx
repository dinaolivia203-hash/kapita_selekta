import { redirect } from "next/navigation";

import { postImageUrl } from "@/lib/format";
import { findPostById } from "@/lib/posts";

import { PostForm } from "./PostForm";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ id?: string | string[] }>;

export default async function PostEditorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId || 0);
  const editing = Number.isFinite(id) && id > 0;
  const post = editing ? await findPostById(id) : null;

  if (editing && !post) {
    redirect("/admin?error=notfound");
  }

  const currentImage = post?.image ? postImageUrl(post.image) : "";

  return (
    <>
      <div className="admin-head">
        <div>
          <p>{post ? "Edit" : "Tulis Baru"}</p>
          <h1>{post ? "Edit berita" : "Tulis berita sekolah"}</h1>
        </div>
        <div className="admin-head__actions">
          <a className="btn-admin btn-admin--light" href="/admin">
            ← Daftar berita
          </a>
          {post?.is_published ? (
            <a
              className="btn-admin btn-admin--light"
              href={`/berita/${encodeURIComponent(post.slug)}`}
              target="_blank"
              rel="noopener"
            >
              Lihat di situs ↗
            </a>
          ) : null}
        </div>
      </div>

      <PostForm post={post} currentImage={currentImage} />
    </>
  );
}
