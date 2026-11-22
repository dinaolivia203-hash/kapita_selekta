"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import {
  clearLoginFailures,
  clientIp,
  createSession,
  loginBlocked,
  recordLoginFailure,
} from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export type LoginState = { error?: string } | null;

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (username === "" || password === "") {
    return { error: "Username dan password wajib diisi." };
  }

  const ip = await clientIp();

  if (await loginBlocked(username, ip)) {
    return {
      error: "Terlalu banyak percobaan gagal. Coba lagi dalam 10 menit.",
    };
  }

  const { data: admin, error } = await supabaseAdmin()
    .from("admins")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("Login gagal:", error.message);
    return { error: "Login gagal karena masalah server. Coba lagi." };
  }

  const valid =
    admin && (await bcrypt.compare(password, String(admin.password_hash)));

  if (!valid) {
    await recordLoginFailure(username, ip);
    return { error: "Username atau password salah." };
  }

  await clearLoginFailures(username, ip);
  await createSession({
    id: Number(admin.id),
    username: String(admin.username),
    name: String(admin.name),
  });

  redirect("/admin");
}
