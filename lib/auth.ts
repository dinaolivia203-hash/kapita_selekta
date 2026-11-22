import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import { supabaseAdmin } from "./supabase";

const COOKIE_NAME = "smk_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type AdminSession = {
  id: number;
  username: string;
  name: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET belum diatur");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(admin: AdminSession): Promise<void> {
  const token = await new SignJWT({ username: admin.username, name: admin.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });

    const id = Number(payload.sub);

    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    return {
      id,
      username: typeof payload.username === "string" ? payload.username : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function clientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip");

  return ip || "0.0.0.0";
}

export async function loginBlocked(username: string, ip: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin()
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .gt("attempted_at", cutoff)
    .or(`username.eq.${username},ip.eq.${ip}`);

  if (error) {
    console.error("Gagal memeriksa batas login:", error.message);
    return false;
  }

  return (count || 0) >= 5;
}

export async function recordLoginFailure(
  username: string,
  ip: string,
): Promise<void> {
  const supabase = supabaseAdmin();

  await supabase.from("login_attempts").insert({
    username: username.slice(0, 80),
    ip,
    attempted_at: new Date().toISOString(),
  });

  await supabase
    .from("login_attempts")
    .delete()
    .lt("attempted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}

export async function clearLoginFailures(
  username: string,
  ip: string,
): Promise<void> {
  await supabaseAdmin()
    .from("login_attempts")
    .delete()
    .or(`username.eq.${username},ip.eq.${ip}`);
}
