"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { destroySession, requireSession } from "@/lib/auth";
import {
  deletePostById,
  findPostById,
  removePostImage,
  savePost,
  setPostPublished,
} from "@/lib/posts";
import { supabaseAdmin } from "@/lib/supabase";
import { isCategory } from "@/lib/types";

export type SavePostState = { error?: string } | null;
export type PasswordState = { error?: string; success?: string } | null;

function refreshPublicPages() {
  revalidatePath("/berita");
  revalidatePath("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function postAction(formData: FormData): Promise<void> {
  await requireSession();

  const id = Number(formData.get("id") || 0);
  const action = String(formData.get("action") || "");

  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin?error=notfound");
  }

  const post = await findPostById(id);

  if (!post) {
    redirect("/admin?error=notfound");
  }

  if (action === "toggle") {
    const next = !post.is_published;
    await setPostPublished(id, next);
    refreshPublicPages();
    redirect(`/admin?msg=${next ? "published" : "hidden"}`);
  }

  if (action === "delete") {
    await removePostImage(post.image);
    await deletePostById(id);
    refreshPublicPages();
    redirect("/admin?msg=deleted");
  }

  redirect("/admin?error=unknown");
}

export async function savePostAction(
  _previous: SavePostState,
  formData: FormData,
): Promise<SavePostState> {
  await requireSession();

  const id = Number(formData.get("id") || 0);
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "berita");
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const isPublished = formData.get("is_published") === "1";
  const removeImage = formData.get("remove_image") === "1";
  const uploadedImage = String(formData.get("image_path") || "").trim();

  if (title.length < 3) {
    return { error: "Judul minimal 3 karakter." };
  }

  if (title.length > 180) {
    return { error: "Judul maksimal 180 karakter." };
  }

  if (!isCategory(category)) {
    return { error: "Kategori tidak valid." };
  }

  if (content.length < 10) {
    return { error: "Isi berita minimal 10 karakter." };
  }

  if (excerpt.length > 320) {
    return { error: "Ringkasan maksimal 320 karakter." };
  }

  if (
    uploadedImage !== "" &&
    (!/^[a-zA-Z0-9/_\-.]+$/.test(uploadedImage) ||
      uploadedImage.includes(".."))
  ) {
    return { error: "Path gambar tidak valid. Silakan unggah ulang." };
  }

  const existing = id > 0 ? await findPostById(id) : null;

  if (id > 0 && !existing) {
    return { error: "Berita yang ingin diedit tidak ditemukan." };
  }

  let image = existing?.image ?? null;

  if (uploadedImage !== "") {
    if (existing?.image && existing.image !== uploadedImage) {
      await removePostImage(existing.image);
    }
    image = uploadedImage;
  } else if (removeImage) {
    await removePostImage(existing?.image ?? null);
    image = null;
  }

  try {
    await savePost({
      id: id > 0 ? id : undefined,
      title,
      category,
      excerpt,
      content,
      image,
      isPublished,
    });
  } catch (error) {
    console.error("Simpan berita gagal:", error);
    return { error: "Berita gagal disimpan. Coba lagi." };
  }

  refreshPublicPages();
  redirect(`/admin?msg=${id > 0 ? "saved" : "created"}`);
}

export async function changePasswordAction(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await requireSession();

  const current = String(formData.get("current_password") || "");
  const next = String(formData.get("new_password") || "");
  const confirm = String(formData.get("confirm_password") || "");

  if (current === "" || next === "" || confirm === "") {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (next.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (next !== confirm) {
    return { error: "Konfirmasi password baru tidak sama." };
  }

  const { data: admin, error } = await supabaseAdmin()
    .from("admins")
    .select("password_hash")
    .eq("id", session.id)
    .maybeSingle();

  if (error || !admin) {
    return { error: "Akun admin tidak ditemukan." };
  }

  if (!(await bcrypt.compare(current, String(admin.password_hash)))) {
    return { error: "Password saat ini salah." };
  }

  const hash = await bcrypt.hash(next, 12);
  const { error: updateError } = await supabaseAdmin()
    .from("admins")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("id", session.id);

  if (updateError) {
    console.error("Ganti password gagal:", updateError.message);
    return { error: "Password gagal diganti. Coba lagi." };
  }

  revalidatePath("/admin");
  return { success: "Password berhasil diganti." };
}
