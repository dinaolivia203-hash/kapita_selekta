"use client";

import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/admin/(panel)/actions";

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const isPosts = pathname === "/admin";
  const isNew = pathname.startsWith("/admin/post");

  return (
    <nav className="admin-nav" aria-label="Navigasi panel admin">
      <a className={isPosts ? "is-active" : ""} href="/admin">
        Berita
      </a>
      <a className={isNew ? "is-active" : ""} href="/admin/post">
        Tulis Baru
      </a>
      <a
        className={pathname.startsWith("/admin/password") ? "is-active" : ""}
        href="/admin/password"
      >
        Password
      </a>
      <a
        className="admin-nav__site"
        href="/#berita"
        target="_blank"
        rel="noopener"
      >
        Lihat Situs ↗
      </a>
      <span
        style={{
          padding: "0 4px",
          fontSize: 11.5,
          color: "rgba(255,255,255,.45)",
        }}
      >
        {name}
      </span>
      <form className="admin-logout" action={logoutAction}>
        <button type="submit">Keluar</button>
      </form>
    </nav>
  );
}
