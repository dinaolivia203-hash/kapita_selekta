import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { storageBucket, supabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Sesi berakhir. Muat ulang halaman lalu login lagi." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    contentType?: string;
    size?: number;
  } | null;

  const contentType = body?.contentType || "";
  const size = Number(body?.size || 0);
  const extension = ALLOWED_TYPES[contentType];

  if (!extension) {
    return NextResponse.json(
      { error: "Format gambar harus JPG, PNG, atau WEBP." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran gambar terlalu besar (maksimal 6 MB)." },
      { status: 400 },
    );
  }

  const now = new Date();
  const prefix = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const path = `${prefix}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabaseAdmin()
    .storage.from(storageBucket())
    .createSignedUploadUrl(path);

  if (error) {
    console.error("Gagal membuat signed upload URL:", error.message);
    return NextResponse.json(
      { error: "Gagal menyiapkan unggahan ke Supabase Storage." },
      { status: 500 },
    );
  }

  let signedUrl = data.signedUrl;

  if (signedUrl.startsWith("/")) {
    signedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${signedUrl}`;
  }

  return NextResponse.json({ path: data.path || path, signedUrl });
}
