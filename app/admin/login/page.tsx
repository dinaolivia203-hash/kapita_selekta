import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login Admin — SMK Bintang Nusantara 2",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/admin");
  }

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

      <div className="auth-body">
        <main className="auth-card">
          <a className="auth-brand" href="/">
            <img src="/assets/img/logo.png" alt="" />
            <span>
              <strong>SMK Bintang Nusantara 2</strong>
              <small>Panel Admin Sekolah</small>
            </span>
          </a>

          <h1>Masuk admin</h1>
          <p className="auth-sub">
            Kelola berita, prestasi, dan kegiatan sekolah.
          </p>

          <LoginForm />

          <p className="auth-foot">
            <a href="/">← Kembali ke website</a>
            <span>Akses khusus pengelola sekolah</span>
          </p>
        </main>
      </div>
    </>
  );
}
