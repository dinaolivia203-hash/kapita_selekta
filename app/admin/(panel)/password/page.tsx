import { PasswordForm } from "./PasswordForm";

export default function PasswordPage() {
  return (
    <>
      <div className="admin-head">
        <div>
          <p>Keamanan</p>
          <h1>Ganti password admin</h1>
        </div>
        <div className="admin-head__actions">
          <a className="btn-admin btn-admin--light" href="/admin">
            ← Daftar berita
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 520 }}>
        <PasswordForm />
      </div>
    </>
  );
}
