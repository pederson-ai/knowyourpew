import { NextResponse } from "next/server";

type GiftScore = {
  giftKey: string;
  giftName: string;
  score: number;
};

type TopGift = {
  gift: string;
  score: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      participant?: {
        name?: string;
        email?: string;
      };
      topGifts?: TopGift[];
      giftScores?: GiftScore[];
    };

    const name = body.participant?.name?.trim();
    const email = body.participant?.email?.trim();
    const topGifts = Array.isArray(body.topGifts) ? body.topGifts : [];
    const giftScores = Array.isArray(body.giftScores) ? body.giftScores : [];

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (topGifts.length === 0 || giftScores.length === 0) {
      return NextResponse.json({ error: "Gift results are required." }, { status: 400 });
    }

    const emailSummary = {
      to: email,
      subject: `Your KnowYourPew results, ${name}`,
      previewText: `Top gifts: ${topGifts.slice(0, 3).map((gift) => `${gift.gift} (${gift.score}/21)`).join(", ")}`,
      html: `
        <h1>Your KnowYourPew Results</h1>
        <p>Hi ${name},</p>
        <p>Thanks for taking the spiritual gifts assessment at Woodridge Baptist Church.</p>
        <h2>Your Top Gifts</h2>
        <ul>
          ${topGifts.slice(0, 5).map((gift) => `<li><strong>${gift.gift}</strong>: ${gift.score}/21</li>`).join("")}
        </ul>
        <h2>All Scores</h2>
        <ul>
          ${giftScores.map((gift) => `<li>${gift.giftName}: ${gift.score}/21</li>`).join("")}
        </ul>
        <p>This route is currently stubbed. Wire it to your email provider when ready.</p>
      `,
    };

    return NextResponse.json({
      ok: true,
      message: `Email summary prepared for ${email}. Provider hookup still needs to be added.`,
      payload: emailSummary,
    });
  } catch (error) {
    console.error("POST /api/email-results failed", error);
    return NextResponse.json({ error: "Unable to prepare email results." }, { status: 500 });
  }
}
