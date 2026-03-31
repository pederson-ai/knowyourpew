import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import assessment from "@/data/assessment.json";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "knowyourpew-admin";
const ALL_GIFT_NAMES = Object.values(assessment.gifts);

function escapeCsv(value: string | null | undefined) {
  const stringValue = value ?? "";
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function buildGiftScoreMap(
  giftScores: Array<{
    giftName: string;
    score: number;
  }>,
) {
  return new Map(giftScores.map((gift) => [gift.giftName, gift.score]));
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

  const header = ["Name", "Email", "Phone", "Sunday School Class", "Date", ...ALL_GIFT_NAMES];
  const rows = submissions.map((submission: (typeof submissions)[number]) => {
    const scoreMap = buildGiftScoreMap(submission.giftScores);

    return [
      submission.name,
      submission.email,
      submission.phone || "",
      submission.sundaySchoolClass || "",
      submission.createdAt.toISOString(),
      ...ALL_GIFT_NAMES.map((giftName) => String(scoreMap.get(giftName) ?? "")),
    ];
  });

  const csv = [header, ...rows]
    .map((row: string[]) => row.map((cell: string) => escapeCsv(String(cell))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="knowyourpew-submissions.csv"',
    },
  });
}
