"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, hashPasscode } from "@/lib/auth";

export async function login(formData: FormData) {
  const passcode = formData.get("passcode");
  const next = formData.get("next");
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/";
  const expected = process.env.ACCESS_PASSCODE;

  if (typeof passcode !== "string" || !expected || passcode !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, await hashPasscode(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(nextPath);
}
