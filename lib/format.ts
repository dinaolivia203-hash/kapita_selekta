import { categoryLabel, isCategory, type Post } from "./types";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function formatTanggal(value: string | number | Date): string {
  return dateFormatter.format(new Date(value));
}

export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

  return slug || "berita";
}

export function buatExcerpt(text: string, limit = 170): string {
  const clean = text.replace(/\s+/g, " ").trim();

  if (clean.length <= limit) {
    return clean;
  }

  return clean.slice(0, limit - 1).trimEnd() + "…";
}

/** Isi berita disimpan sebagai teks biasa; baris kosong = paragraf baru. */
export function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Gambar unggahan disimpan sebagai path bucket, gambar bawaan sebagai /assets/... */
export function postImageUrl(image: string | null | undefined): string {
  const value = (image || "").trim();

  if (!value) {
    return "";
  }

  if (/^(https?:\/\/|\/)/i.test(value)) {
    return value;
  }

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "foto";
  const path = value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function isStoragePath(image: string | null | undefined): boolean {
  const value = (image || "").trim();
  return value !== "" && !/^(https?:\/\/|\/)/i.test(value);
}

export function normalizeCategory(value: string | undefined | null): string {
  const category = (value || "").toLowerCase().trim();
  return isCategory(category) ? category : "";
}

export type ApiPostItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_label: string;
  excerpt: string;
  image: string;
  date: string;
  date_iso: string;
  url: string;
};

export function toApiItem(post: Post): ApiPostItem {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    category_label: categoryLabel(post.category),
    excerpt: post.excerpt,
    image: postImageUrl(post.image),
    date: formatTanggal(post.created_at),
    date_iso: new Date(post.created_at).toISOString(),
    url: `/berita/${encodeURIComponent(post.slug)}`,
  };
}
