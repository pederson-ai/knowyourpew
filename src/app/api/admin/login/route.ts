import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "knowyourpew-admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin?error=missing-password", request.url));
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin?error=invalid-password", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
