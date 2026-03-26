import assessment from "@/data/assessment.json";

export type GiftKey = keyof typeof assessment["gifts"];
export type Question = (typeof assessment)["questions"][number];

export function scoreAnswers(answers: Record<number, number>) {
  const giftScores: Record<string, number> = {};
  for (const q of assessment.questions) {
    if (answers[q.id] !== undefined) {
      giftScores[q.category] = (giftScores[q.category] || 0) + answers[q.id];
    }
  }

  const result = Object.entries(giftScores).map(([category, score]) => ({
    category,
    gift: assessment.gifts[category as GiftKey],
    score,
  }));

  result.sort((a, b) => b.score - a.score);
  return result;
}

export function buildGiftScorePayload(answers: Record<number, number>) {
  return scoreAnswers(answers).map(({ category, gift, score }) => ({
    giftKey: category,
    giftName: gift,
    score,
  }));
}

export function groupQuestions(questions: Question[], perPage: number) {
  const chunks: Question[][] = [];
  for (let i = 0; i < questions.length; i += perPage) {
    const chunk = questions.slice(i, i + perPage);
    chunks.push(
      chunk
        .map((q) => ({ ...q, sortOrder: Math.random() }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => {
          const { sortOrder, ...q } = item;
          void sortOrder;
          return q;
        }),
    );
  }
  return chunks;
}
