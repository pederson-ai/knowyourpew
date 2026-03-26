import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

type GiftScoreInput = {
  giftKey: string;
  giftName: string;
  score: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      sundaySchoolClass?: string;
      giftScores?: GiftScoreInput[];
    };

    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim() || null;
    const sundaySchoolClass = body.sundaySchoolClass?.trim() || null;
    const giftScores = Array.isArray(body.giftScores) ? body.giftScores : [];

    if (!name) {
      return badRequest("Name is required.");
    }

    if (!email) {
      return badRequest("Email is required.");
    }

    if (giftScores.length === 0) {
      return badRequest("Gift scores are required.");
    }

    const submission = await prisma.submission.create({
      data: {
        name,
        email,
        phone,
        sundaySchoolClass,
        giftScores: {
          create: giftScores.map((gift) => ({
            giftKey: gift.giftKey,
            giftName: gift.giftName,
            score: gift.score,
          })),
        },
      },
      include: {
        giftScores: true,
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions failed", error);
    return NextResponse.json({ error: "Unable to save submission." }, { status: 500 });
  }
}
