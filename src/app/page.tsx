"use client";

import React, { useEffect, useMemo, useState } from "react";
import Welcome from "../components/Welcome";
import Assessment from "../components/Assessment";
import Results from "../components/Results";

type ParticipantInfo = {
  name: string;
  email: string;
  phone: string;
  sundaySchoolClass: string;
};

type SavedAssessmentState = {
  participant: ParticipantInfo;
  answers: Record<number, number>;
  page: number;
  savedAt: string;
};

const STORAGE_KEY = "knowyourpew-assessment-state";

const emptyParticipant: ParticipantInfo = {
  name: "",
  email: "",
  phone: "",
  sundaySchoolClass: "",
};

const emptySavedState: SavedAssessmentState = {
  participant: emptyParticipant,
  answers: {},
  page: 0,
  savedAt: "",
};

function hasSavedProgress(savedState: SavedAssessmentState | null) {
  if (!savedState) {
    return false;
  }

  const hasParticipant = Boolean(savedState.participant.name || savedState.participant.email);
  const hasAnswers = Object.keys(savedState.answers).length > 0;

  return hasParticipant || hasAnswers;
}

export default function HomePage() {
  const [step, setStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [participant, setParticipant] = useState<ParticipantInfo>(emptyParticipant);
  const [answers, setAnswers] = useState<Record<number, number> | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [resumeCandidate, setResumeCandidate] = useState<SavedAssessmentState | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStorageReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SavedAssessmentState>;
      const nextState: SavedAssessmentState = {
        ...emptySavedState,
        ...parsed,
        participant: {
          ...emptyParticipant,
          ...(parsed.participant ?? {}),
        },
        answers: parsed.answers ?? {},
        page: typeof parsed.page === "number" ? parsed.page : 0,
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
      };

      if (hasSavedProgress(nextState)) {
        setResumeCandidate(nextState);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const resumeLabel = useMemo(() => {
    if (!resumeCandidate?.savedAt) {
      return "You have saved progress on this device.";
    }

    const savedDate = new Date(resumeCandidate.savedAt);
    if (Number.isNaN(savedDate.getTime())) {
      return "You have saved progress on this device.";
    }

    return `Saved ${savedDate.toLocaleString()}`;
  }, [resumeCandidate]);

  const clearSavedState = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setResumeCandidate(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#fff_22%,_#eff6ff_60%,_#dbeafe_100%)] flex flex-col items-center">
      <header className="sticky top-0 z-30 w-full border-b border-amber-200 bg-blue-950/95 shadow-lg backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 text-white sm:px-5">
          <div className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
            <span>⛪️</span>
            <span>KnowYourPew</span>
          </div>
          {step === "questions" && (
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Progress</div>
              <div className="text-lg font-bold sm:text-xl">{completionPercentage}%</div>
            </div>
          )}
        </div>
      </header>
      <div className="w-full max-w-5xl flex-1 px-3 pb-14 pt-6 sm:px-5 sm:pt-8">
        {step === "welcome" && (
          <div className="space-y-4">
            {storageReady && hasSavedProgress(resumeCandidate) && resumeCandidate && (
              <section className="mx-auto w-full max-w-3xl rounded-3xl border border-amber-200 bg-white/95 p-5 shadow-lg shadow-amber-100 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-500">Resume available</p>
                    <h2 className="mt-2 text-2xl font-bold text-blue-950">Resume where you left off?</h2>
                    <p className="mt-2 text-sm text-slate-600 sm:text-base">
                      {resumeLabel}
                      {resumeCandidate.participant.name ? ` for ${resumeCandidate.participant.name}.` : "."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:w-auto sm:min-w-56">
                    <button
                      type="button"
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                      onClick={() => {
                        setParticipant(resumeCandidate.participant);
                        setAnswers(resumeCandidate.answers);
                        setCompletionPercentage(0);
                        setStep("questions");
                      }}
                    >
                      Resume Assessment
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-amber-200 px-5 py-3 text-sm font-semibold text-blue-950 transition hover:bg-amber-50"
                      onClick={clearSavedState}
                    >
                      Start Fresh
                    </button>
                  </div>
                </div>
              </section>
            )}
            <Welcome
              onStart={(nextParticipant) => {
                setParticipant(nextParticipant);
                setAnswers(null);
                setCompletionPercentage(0);
                setStep("questions");
              }}
            />
          </div>
        )}
        {step === "questions" && (
          <Assessment
            participant={participant}
            initialAnswers={answers ?? undefined}
            initialPage={resumeCandidate?.page ?? 0}
            onProgressChange={setCompletionPercentage}
            onComplete={(nextAnswers) => {
              setAnswers(nextAnswers);
              setCompletionPercentage(100);
              clearSavedState();
              setStep("results");
            }}
          />
        )}
        {step === "results" && answers && (
          <Results
            answers={answers}
            participant={participant}
            onRestart={() => {
              clearSavedState();
              setAnswers(null);
              setParticipant(emptyParticipant);
              setCompletionPercentage(0);
              setStep("welcome");
            }}
          />
        )}
      </div>
    </main>
  );
}
