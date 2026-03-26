"use client";

import React, { useEffect, useMemo, useState } from "react";
import giftDescriptions from "@/data/gift-descriptions.json";
import { buildGiftScorePayload, scoreAnswers } from "@/lib/scoring";

type ParticipantInfo = {
  name: string;
  email: string;
  phone: string;
  sundaySchoolClass: string;
};

interface ResultsProps {
  answers: Record<number, number>;
  participant: ParticipantInfo;
  onRestart: () => void;
}

function parseGiftDescription(str: string) {
  const sections = str.split("\n\n");
  const distinctivesIdx = sections.findIndex((s) => s.toUpperCase().includes("DISTINCTIVES:"));
  const overviewParts = distinctivesIdx > 0 ? sections.slice(0, distinctivesIdx) : [sections[0]];
  const overview = overviewParts.join("\n").trim();

  const distinctivesSection = sections.find((s) => s.toUpperCase().includes("DISTINCTIVES:"));
  const distinctives = distinctivesSection?.split("•").slice(1).map((d) => d.trim()).filter(Boolean);

  const traitsSection = sections.find((s) => s.toUpperCase().startsWith("TRAITS:"));
  const traits = traitsSection?.replace(/^TRAITS:\s*/i, "").split("•").map((t) => t.trim()).filter(Boolean);

  const cautionsSection = sections.find((s) => s.toUpperCase().includes("CAUTIONS:"));
  const cautions = cautionsSection?.split("•").slice(1).map((c) => c.trim()).filter(Boolean);

  return { overview, distinctives, traits, cautions };
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, index) => index);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden print:hidden" aria-hidden="true">
      {pieces.map((piece) => {
        const left = 5 + piece * 5;
        const delay = (piece % 6) * 120;
        const duration = 1900 + (piece % 5) * 180;
        const colors = ["bg-amber-400", "bg-blue-700", "bg-emerald-500", "bg-rose-400"];
        return (
          <span
            key={piece}
            className={`absolute top-0 h-3 w-2 rounded-full ${colors[piece % colors.length]} animate-[confetti-fall_var(--confetti-duration)_ease-out_forwards]`}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}ms`,
              ["--confetti-duration" as string]: `${duration}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Results({ answers, participant, onRestart }: ResultsProps) {
  const scored = useMemo(() => scoreAnswers(answers), [answers]);
  const topGifts = scored.slice(0, 5);
  const giftScores = useMemo(() => buildGiftScorePayload(answers), [answers]);

  const [open, setOpen] = useState<string | null>(topGifts[0]?.gift ?? null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("Preparing your summary.");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function saveResults() {
      setSaveState("saving");
      setSaveMessage("Saving your results for the church team.");

      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...participant,
            giftScores,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save submission");
        }

        if (!cancelled) {
          setSaveState("saved");
          setSaveMessage("Saved successfully. You can print or email your results below.");
        }
      } catch {
        if (!cancelled) {
          setSaveState("error");
          setSaveMessage("Results are visible, but they could not be saved right now.");
        }
      }
    }

    void saveResults();

    return () => {
      cancelled = true;
    };
  }, [giftScores, participant]);

  async function handleEmailResults() {
    setEmailState("sending");
    setEmailMessage("Preparing your email summary.");

    try {
      const response = await fetch("/api/email-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant,
          topGifts,
          giftScores,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Email request failed");
      }

      setEmailState("sent");
      setEmailMessage(data.message || "Email summary prepared.");
    } catch (error) {
      setEmailState("error");
      setEmailMessage(error instanceof Error ? error.message : "Unable to prepare the email summary.");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 print:max-w-none">
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-blue-100 print:shadow-none">
        <ConfettiBurst />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Assessment Complete</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-950">Results for {participant.name}</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Your strongest gifts rose to the top based on the patterns in your responses.
            </p>
          </div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium print:hidden ${
              saveState === "saved"
                ? "bg-emerald-50 text-emerald-700"
                : saveState === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {saveMessage}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100 print:border-slate-200 print:shadow-none sm:p-6">
        <h3 className="text-xl font-semibold text-blue-950">All Gift Scores</h3>
        <div className="mt-6 flex flex-col gap-3">
          {scored.map(({ gift, score }) => {
            const isTop = topGifts.some((g) => g.gift === gift);
            return (
              <div key={gift} className="flex items-center gap-3">
                <span className={`w-28 shrink-0 text-right text-sm sm:w-36 sm:text-base ${isTop ? "font-bold text-blue-950" : "text-slate-600"}`}>
                  {gift}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-amber-100">
                  <div
                    className={`h-5 rounded-full ${isTop ? "bg-blue-950" : "bg-amber-400"}`}
                    style={{ width: `${Math.round((score / 21) * 100)}%` }}
                  />
                </div>
                <span className={`w-12 text-sm sm:text-base ${isTop ? "font-bold text-blue-950" : "text-slate-500"}`}>
                  {score}/21
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100 print:border-slate-200 print:shadow-none sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-blue-950">Your Top Spiritual Gifts</h3>
          <div className="flex flex-col gap-3 sm:flex-row print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              Print Results
            </button>
            <button
              type="button"
              onClick={handleEmailResults}
              disabled={emailState === "sending"}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emailState === "sending" ? "Sending..." : "Email My Results"}
            </button>
          </div>
        </div>
        {emailMessage && (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium print:hidden ${
              emailState === "sent"
                ? "bg-emerald-50 text-emerald-700"
                : emailState === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {emailMessage}
          </div>
        )}
        <div className="mt-5 flex flex-col gap-4">
          {topGifts.map(({ gift, score }, index) => {
            const descObj = (giftDescriptions as Record<string, { name: string; subtitle: string; description: string; rank: number }>)[gift];
            const desc = descObj
              ? parseGiftDescription(descObj.description)
              : { overview: "", distinctives: undefined, traits: undefined, cautions: undefined };
            return (
              <div key={gift} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm print:break-inside-avoid print:bg-white">
                <button
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => setOpen(open === gift ? null : gift)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-blue-950">
                        {index + 1}
                      </span>
                      <span className="text-lg font-bold text-blue-950">{gift}</span>
                      <span className="text-sm font-semibold text-amber-600">{score}/21</span>
                    </div>
                    {descObj?.subtitle && <p className="mt-2 text-sm italic text-slate-500">{descObj.subtitle}</p>}
                  </div>
                  <span className="text-xl text-blue-950 print:hidden">{open === gift ? "−" : "+"}</span>
                </button>
                {(open === gift || typeof window === "undefined") && (
                  <div className="mt-4 text-blue-950 print:block">
                    <p className="text-base leading-7">{desc.overview}</p>
                    {desc.distinctives && (
                      <>
                        <div className="mt-4 font-semibold">Distinctives</div>
                        <ul className="ml-6 mt-2 list-disc space-y-1">
                          {desc.distinctives.map((d, i) => (
                            <li key={i}>{d.trim()}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {desc.traits && (
                      <>
                        <div className="mt-4 font-semibold">Traits</div>
                        <ul className="ml-6 mt-2 list-disc space-y-1">
                          {desc.traits.map((d, i) => (
                            <li key={i}>{d.trim()}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {desc.cautions && (
                      <>
                        <div className="mt-4 font-semibold">Cautions</div>
                        <ul className="ml-6 mt-2 list-disc space-y-1">
                          {desc.cautions.map((d, i) => (
                            <li key={i}>{d.trim()}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row print:hidden">
        <button
          className="flex-1 rounded-2xl bg-blue-950 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-900"
          onClick={onRestart}
        >
          Start Over
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              void navigator.share({
                title: "KnowYourPew",
                text: `I just completed the KnowYourPew spiritual gifts assessment. My top gift is ${topGifts[0]?.gift}.`,
                url: window.location.origin,
              });
            } else {
              window.print();
            }
          }}
          className="flex-1 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-3 font-semibold text-blue-950 transition hover:bg-amber-100"
        >
          Share Results
        </button>
      </div>
    </div>
  );
}
