import { NextResponse } from "next/server";

import { normalizeCategory, toApiItem } from "@/lib/format";
import { findPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = normalizeCategory(searchParams.get("kategori"));
  const limit = Math.max(1, Math.min(24, Number(searchParams.get("limit")) || 9));

  try {
    const posts = await findPosts(category, limit);
    const items = posts.map(toApiItem);

    return NextResponse.json(
      { items, category, count: items.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("API posts gagal:", error);

    return NextResponse.json(
      { items: [], count: 0, error: "server" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
