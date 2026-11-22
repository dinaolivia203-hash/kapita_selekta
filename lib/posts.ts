import "server-only";

import { buatExcerpt, isStoragePath, slugify } from "./format";
import { storageBucket, supabaseAdmin } from "./supabase";
import type { Post } from "./types";

type PostRow = Omit<Post, "is_published"> & { is_published: boolean | number };

function mapPost(row: PostRow): Post {
  return {
    ...row,
    id: Number(row.id),
    is_published:
      row.is_published === true ||
      row.is_published === 1 ||
      String(row.is_published) === "true",
  };
}

function fail(context: string, message: string): never {
  throw new Error(`${context}: ${message}`);
}

export async function findPosts(
  category = "",
  limit = 9,
  onlyPublished = true,
): Promise<Post[]> {
  let query = supabaseAdmin()
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(Math.max(1, Math.min(60, limit)));

  if (onlyPublished) {
    query = query.eq("is_published", true);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    fail("Gagal memuat berita", error.message);
  }

  return (data || []).map((row) => mapPost(row as PostRow));
}

export async function findAllPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    fail("Gagal memuat berita", error.message);
  }

  return (data || []).map((row) => mapPost(row as PostRow));
}

export async function findPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    fail("Gagal memuat berita", error.message);
  }

  return data ? mapPost(data as PostRow) : null;
}

export async function findPostById(id: number): Promise<Post | null> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    fail("Gagal memuat berita", error.message);
  }

  return data ? mapPost(data as PostRow) : null;
}

export async function uniqueSlug(slug: string, ignoreId = 0): Promise<string> {
  const base = slugify(slug);
  let candidate = base;
  let number = 2;

  for (;;) {
    let query = supabaseAdmin()
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (ignoreId > 0) {
      query = query.neq("id", ignoreId);
    }

    const { data, error } = await query;

    if (error) {
      fail("Gagal memeriksa slug", error.message);
    }

    if (!data || data.length === 0) {
      return candidate;
    }

    candidate = `${base}-${number}`;
    number += 1;
  }
}

export type SavePostInput = {
  id?: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string | null;
  isPublished: boolean;
};

export async function savePost(input: SavePostInput): Promise<Post> {
  const now = new Date().toISOString();
  const excerpt = input.excerpt || buatExcerpt(input.content, 200);
  const editingId = Number(input.id || 0);

  if (editingId > 0) {
    const { data, error } = await supabaseAdmin()
      .from("posts")
      .update({
        title: input.title,
        category: input.category,
        excerpt,
        content: input.content,
        image: input.image,
        is_published: input.isPublished,
        updated_at: now,
      })
      .eq("id", editingId)
      .select("*")
      .single();

    if (error) {
      fail("Gagal menyimpan berita", error.message);
    }

    return mapPost(data as PostRow);
  }

  const slug = await uniqueSlug(input.title);

  const { data, error } = await supabaseAdmin()
    .from("posts")
    .insert({
      title: input.title,
      slug,
      category: input.category,
      excerpt,
      content: input.content,
      image: input.image,
      is_published: input.isPublished,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    fail("Gagal menyimpan berita", error.message);
  }

  return mapPost(data as PostRow);
}

export async function setPostPublished(
  id: number,
  published: boolean,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("posts")
    .update({ is_published: published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    fail("Gagal mengubah status berita", error.message);
  }
}

export async function deletePostById(id: number): Promise<void> {
  const { error } = await supabaseAdmin().from("posts").delete().eq("id", id);

  if (error) {
    fail("Gagal menghapus berita", error.message);
  }
}

/** Hapus gambar unggahan dari Supabase Storage (gambar bawaan /assets tidak disentuh). */
export async function removePostImage(image: string | null | undefined): Promise<void> {
  if (!isStoragePath(image)) {
    return;
  }

  const { error } = await supabaseAdmin()
    .storage.from(storageBucket())
    .remove([image as string]);

  if (error) {
    console.error("Gagal menghapus gambar:", error.message);
  }
}
