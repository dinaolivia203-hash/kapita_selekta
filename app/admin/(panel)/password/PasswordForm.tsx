"use client";

import { useActionState } from "react";

import {
  changePasswordAction,
  type PasswordState,
} from "@/app/admin/(panel)/actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    null,
  );

  return (
    <form className="admin-panel" action={formAction}>
      <h2>Password akun</h2>

      {state?.error ? (
        <div className="alert alert--error" style={{ marginBottom: 16 }}>
          <span>{state.error}</span>
        </div>
      ) : null}

      {state?.success ? (
        <div className="alert alert--success" style={{ marginBottom: 16 }}>
          <span>{state.success}</span>
        </div>
      ) : null}

      <div className="field field--light">
        <label htmlFor="current_password">Password saat ini</label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <div className="field field--light">
        <label htmlFor="new_password">Password baru</label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <span className="field__hint">Minimal 8 karakter.</span>
      </div>

      <div className="field field--light">
        <label htmlFor="confirm_password">Ulangi password baru</label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="form-actions">
        <button className="btn-admin" type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Ganti password"}
        </button>
      </div>
    </form>
  );
}
