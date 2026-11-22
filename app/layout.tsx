import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SMK Bintang Nusantara 2 — Tanjungbintang, Lampung Selatan",
  description:
    "Website profil SMK Bintang Nusantara 2: profil sekolah, jurusan, fasilitas, galeri, berita, prestasi, dan kegiatan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
