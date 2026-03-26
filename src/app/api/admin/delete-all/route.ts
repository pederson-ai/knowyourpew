import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "knowyourpew-admin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get(ADMIN_COOKIE)?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.submission.deleteMany();

  return NextResponse.redirect(new URL("/admin?deleted=1", request.url));
}
