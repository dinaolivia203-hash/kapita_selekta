"use client";

import { useActionState, useState } from "react";

import { CATEGORIES, type Post } from "@/lib/types";

import { savePostAction, type SavePostState } from "../actions";

type Props = {
  post: Post | null;
  currentImage: string;
};

export function PostForm({ post, currentImage }: Props) {
  const editing = post !== null;
  const [state, formAction, pending] = useActionState<SavePostState, FormData>(
    savePostAction,
    null,
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? "berita");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? true);

  const [imagePath, setImagePath] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const shownImage = preview || (removeImage ? "" : currentImage);
  const busy = pending || uploading;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Format gambar harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setUploadError("Ukuran gambar terlalu besar (maksimal 6 MB).");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const signResponse = await fetch("/api/admin/upload-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!signResponse.ok) {
        const data = await signResponse.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyiapkan unggahan gambar.");
      }

      const signed = (await signResponse.json()) as {
        path: string;
        signedUrl: string;
      };

      const uploadResponse = await fetch(signed.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Gambar gagal diunggah ke Supabase Storage.");
      }

      setImagePath(signed.path);
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Gambar gagal diunggah. Coba lagi.",
      );
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="admin-form" action={formAction}>
      <input type="hidden" name="id" value={post?.id ?? 0} />
      <input type="hidden" name="image_path" value={imagePath} />
      {removeImage ? (
        <input type="hidden" name="remove_image" value="1" />
      ) : null}

      {state?.error ? (
        <div
          className="alert alert--error"
          style={{ gridColumn: "1 / -1", margin: 0 }}
        >
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="admin-panel">
        <h2>Isi berita</h2>

        <div className="field field--light">
          <label htmlFor="title">Judul</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={180}
            placeholder="Contoh: Siswa TSM mengikuti praktik servis mesin"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field field--light">
          <label htmlFor="content">Isi berita</label>
          <textarea
            id="content"
            name="content"
            required
            placeholder={
              "Tulis berita selengkapnya di sini.\n\nPisahkan antarparagraf dengan satu baris kosong."
            }
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <span className="field__hint">
            Baris kosong akan menjadi paragraf baru.
          </span>
        </div>

        <div className="field field--light">
          <label htmlFor="excerpt">Ringkasan (opsional)</label>
          <textarea
            id="excerpt"
            name="excerpt"
            maxLength={320}
            style={{ minHeight: 96 }}
            placeholder="Ringkasan singkat yang tampil di kartu berita."
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
          />
          <span className="field__hint">
            Kosongkan untuk mengambil otomatis dari isi berita.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <div className="admin-panel">
          <h2>Publikasi</h2>

          <div className="field field--light">
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as typeof category)
              }
            >
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              name="is_published"
              value="1"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            <span>
              Terbitkan di website
              <small>Jika tidak dicentang, berita disimpan sebagai draf.</small>
            </span>
          </label>
        </div>

        <div className="admin-panel">
          <h2>Gambar utama</h2>

          {shownImage ? (
            <div className="image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shownImage} alt="Gambar saat ini" />
              <p>
                {preview
                  ? "Gambar baru siap disimpan."
                  : "Gambar saat ini. Unggah gambar baru untuk menggantinya."}
              </p>
            </div>
          ) : null}

          {currentImage && !preview ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(event) => {
                  setRemoveImage(event.target.checked);
                  if (event.target.checked) {
                    setImagePath("");
                    setPreview("");
                  }
                }}
              />
              <span>Hapus gambar ini</span>
            </label>
          ) : null}

          <div className="field field--light">
            <label htmlFor="image">
              {shownImage ? "Ganti gambar" : "Unggah gambar"}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              disabled={busy}
            />
            <span className="field__hint">
              JPG, PNG, atau WEBP. Maksimal 6 MB. Gambar diunggah langsung ke
              Supabase Storage.
            </span>
          </div>

          {uploading ? (
            <div className="alert alert--info">
              <span>Mengunggah gambar…</span>
            </div>
          ) : null}

          {uploadError ? (
            <div className="alert alert--error">
              <span>{uploadError}</span>
            </div>
          ) : null}

          <div className="form-actions">
            <button className="btn-admin" type="submit" disabled={busy}>
              {pending
                ? "Menyimpan…"
                : editing
                  ? "Simpan perubahan"
                  : "Simpan berita"}
            </button>
            <a className="btn-admin btn-admin--light" href="/admin">
              Batal
            </a>
          </div>
        </div>

        <div className="admin-panel">
          <h2>Tips</h2>
          <ul className="helper-list">
            <li>Gunakan judul yang singkat dan jelas.</li>
            <li>
              Pilih kategori <strong>Prestasi</strong> untuk lomba atau
              penghargaan.
            </li>
            <li>
              Pilih <strong>Kegiatan</strong> untuk acara sekolah.
            </li>
            <li>Ukuran gambar ideal 1600 × 900 piksel.</li>
          </ul>
        </div>
      </div>
    </form>
  );
}
