import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/AdminNav";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel Admin — SMK Bintang Nusantara 2",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireSession();

  return (
    <>
      <link rel="icon" type="image/png" href="/assets/img/logo.png" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/assets/admin.css" />

      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <a className="admin-brand" href="/admin">
            <img src="/assets/img/logo.png" alt="" />
            <span>
              <strong>Panel Admin</strong>
              <small>SMK Bintang Nusantara 2</small>
            </span>
          </a>

          <AdminNav name={admin.name} />
        </div>
      </header>

      <main className="admin-main">{children}</main>
    </>
  );
}
