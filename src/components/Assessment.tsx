"use client";

import React, { useEffect, useMemo, useState } from "react";
import assessment from "@/data/assessment.json";
import ProgressBar from "./ProgressBar";
import { groupQuestions } from "@/lib/scoring";

interface AssessmentProps {
  onComplete: (answers: Record<number, number>) => void;
  onProgressChange: (percentage: number) => void;
  participantName: string;
}

const QUESTIONS_PER_PAGE = 7;
const answerLabels = ["Not at all", "Some of the time", "Most of the time", "Consistently true"];

export default function Assessment({ onComplete, onProgressChange, participantName }: AssessmentProps) {
  const sections = useMemo(() => groupQuestions(assessment.questions, QUESTIONS_PER_PAGE), []);
  const total = assessment.questions.length;
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleChange = (id: number, value: number) => {
    setAnswers((old) => ({ ...old, [id]: value }));
  };

  const current = sections[page];
  const answeredCount = Object.keys(answers).length;
  const completionPercentage = Math.round((answeredCount / total) * 100);
  const allAnswered = current.every((q) => answers[q.id] !== undefined);

  useEffect(() => {
    onProgressChange(completionPercentage);
  }, [completionPercentage, onProgressChange]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" id="assessment-top">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-blue-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Spiritual Gifts Assessment</p>
            <h2 className="mt-2 text-2xl font-bold text-blue-950 sm:text-3xl">{participantName}, you&apos;re making good progress.</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">Select the response that best matches each statement.</p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
          >
            Back to top
          </button>
        </div>
        <div className="mt-4">
          <ProgressBar value={answeredCount} max={total} />
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500 sm:text-sm">
            <span>Section {page + 1} of {sections.length}</span>
            <span>{answeredCount} of {total} answered · {completionPercentage}% complete</span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {current.map((q) => (
          <li key={q.id} className="rounded-3xl border border-blue-100 bg-white p-4 shadow-md shadow-blue-100 sm:p-5">
            <div className="text-base font-semibold leading-7 text-blue-950 sm:text-lg">{q.text}</div>
            <div className="mt-4 grid gap-3">
              {[0, 1, 2, 3].map((value) => {
                const checked = answers[q.id] === value;
                return (
                  <label
                    key={value}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition sm:min-h-14 ${
                      checked
                        ? "border-blue-900 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={value}
                      checked={checked}
                      onChange={() => handleChange(q.id, value)}
                      className="h-5 w-5 shrink-0 accent-amber-500"
                    />
                    <span className="flex items-center gap-3 text-sm text-blue-950 sm:text-base">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-blue-900 shadow-sm">
                        {value}
                      </span>
                      <span>{answerLabels[value]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-3 z-20 flex gap-3 rounded-3xl border border-white/80 bg-white/95 p-3 shadow-xl shadow-blue-100 backdrop-blur sm:bottom-5 print:hidden">
        <button
          className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-slate-200 px-5 py-3 font-medium text-blue-950 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => goToPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        {page < sections.length - 1 ? (
          <button
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => goToPage(Math.min(sections.length - 1, page + 1))}
            disabled={!allAnswered}
          >
            Next Section
          </button>
        ) : (
          <button
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-blue-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onComplete(answers)}
            disabled={!allAnswered}
          >
            See Results
          </button>
        )}
      </div>
    </div>
  );
}
