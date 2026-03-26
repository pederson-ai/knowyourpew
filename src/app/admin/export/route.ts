import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "knowyourpew-admin";

function escapeCsv(value: string | null | undefined) {
  const stringValue = value ?? "";
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function getTopThreeGifts(
  giftScores: Array<{
    giftName: string;
    score: number;
  }>,
) {
  return [...giftScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((gift) => `${gift.giftName} (${gift.score})`)
    .join(", ");
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get(ADMIN_COOKIE)?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  const submissions = await prisma.submission.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { sundaySchoolClass: { contains: query } },
          ],
        }
      : undefined,
    include: {
      giftScores: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const header = ["Name", "Email", "Phone", "Sunday School Class", "Date", "Top 3 Gifts"];
  const rows = submissions.map((submission) => [
    submission.name,
    submission.email,
    submission.phone || "",
    submission.sundaySchoolClass || "",
    submission.createdAt.toISOString(),
    getTopThreeGifts(submission.giftScores),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="knowyourpew-submissions.csv"',
    },
  });
}
