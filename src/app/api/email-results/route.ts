import { NextResponse } from "next/server";
import { sendMicrosoftGraphMail } from "@/lib/msgraph";

type GiftScore = {
  giftKey: string;
  giftName: string;
  score: number;
};

type TopGift = {
  gift: string;
  score: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(name: string, topGifts: TopGift[], giftScores: GiftScore[]) {
  const safeName = escapeHtml(name);
  const previewText = `Top gifts: ${topGifts.slice(0, 5).map((gift) => `${gift.gift} (${gift.score}/21)`).join(", ")}`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KnowYourPew Results</title>
  </head>
  <body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff6ff;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dbeafe;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="background:#172554;padding:28px 24px;text-align:center;">
                <div style="display:inline-block;background:#fbbf24;color:#172554;font-weight:800;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;border-radius:999px;padding:8px 14px;">Woodridge Baptist Church</div>
                <h1 style="margin:18px 0 8px;color:#ffffff;font-size:30px;line-height:1.2;">Your KnowYourPew Results</h1>
                <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.6;">A snapshot of how God may be wiring you to serve.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">Hi ${safeName},</p>
                <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">Thanks for taking the spiritual gifts assessment at Woodridge Baptist Church. Here are your top five gifts along with your full score breakdown.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 0;">
                <h2 style="margin:0 0 16px;color:#172554;font-size:22px;">Top 5 Gifts</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px;">
                ${topGifts
                  .slice(0, 5)
                  .map(
                    (gift, index) => `
                      <div style="margin:0 0 12px;border:1px solid #fde68a;border-radius:18px;background:#fffbeb;padding:16px;">
                        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                          <div>
                            <div style="display:inline-block;background:#fbbf24;color:#172554;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">#${index + 1}</div>
                            <div style="margin-top:10px;color:#172554;font-size:20px;font-weight:800;">${escapeHtml(gift.gift)}</div>
                          </div>
                          <div style="color:#172554;font-size:24px;font-weight:800;">${gift.score}<span style="font-size:15px;font-weight:600;color:#64748b;">/21</span></div>
                        </div>
                      </div>`,
                  )
                  .join("")}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 0;">
                <h2 style="margin:0 0 16px;color:#172554;font-size:22px;">All Scores</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dbeafe;border-radius:18px;overflow:hidden;">
                  <thead>
                    <tr style="background:#172554;color:#ffffff;">
                      <th align="left" style="padding:14px 16px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Gift</th>
                      <th align="right" style="padding:14px 16px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${giftScores
                      .map(
                        (gift, index) => `
                          <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                            <td style="padding:12px 16px;border-top:1px solid #e2e8f0;font-size:15px;color:#0f172a;">${escapeHtml(gift.giftName)}</td>
                            <td align="right" style="padding:12px 16px;border-top:1px solid #e2e8f0;font-size:15px;font-weight:700;color:#172554;">${gift.score}/21</td>
                          </tr>`,
                      )
                      .join("")}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="border-radius:18px;background:#eff6ff;padding:16px 18px;color:#1e3a8a;font-size:14px;line-height:1.7;">
                  These results are a conversation starter, not a final label. Share them with a ministry leader and talk through where you may be most fruitful in service.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 28px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                KnowYourPew · Woodridge Baptist Church
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildPlainText(name: string, topGifts: TopGift[], giftScores: GiftScore[]) {
  return [
    `KnowYourPew Results for ${name}`,
    "",
    "Top 5 Gifts:",
    ...topGifts.slice(0, 5).map((gift, index) => `${index + 1}. ${gift.gift}: ${gift.score}/21`),
    "",
    "All Scores:",
    ...giftScores.map((gift) => `- ${gift.giftName}: ${gift.score}/21`),
  ].join("\n");
}

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

    const sortedScores = [...giftScores].sort((a, b) => b.score - a.score || a.giftName.localeCompare(b.giftName));
    const html = buildEmailHtml(name, topGifts, sortedScores);
    const text = buildPlainText(name, topGifts, sortedScores);

    await sendMicrosoftGraphMail({
      to: email,
      subject: `Your KnowYourPew results, ${name}`,
      html,
      text,
    });

    return NextResponse.json({
      ok: true,
      message: `Your results were emailed to ${email}.`,
    });
  } catch (error) {
    console.error("POST /api/email-results failed", error);
    return NextResponse.json({ error: "Unable to send email results right now." }, { status: 500 });
  }
}
