"use client";

import React, { useEffect, useState } from "react";
import Welcome from "../components/Welcome";
import Assessment from "../components/Assessment";
import Results from "../components/Results";

type ParticipantInfo = {
  name: string;
  email: string;
  phone: string;
  sundaySchoolClass: string;
};

const emptyParticipant: ParticipantInfo = {
  name: "",
  email: "",
  phone: "",
  sundaySchoolClass: "",
};

export default function HomePage() {
  const [step, setStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [participant, setParticipant] = useState<ParticipantInfo>(emptyParticipant);
  const [answers, setAnswers] = useState<Record<number, number> | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
          <Welcome
            onStart={(nextParticipant) => {
              setParticipant(nextParticipant);
              setCompletionPercentage(0);
              setStep("questions");
            }}
          />
        )}
        {step === "questions" && (
          <Assessment
            participantName={participant.name}
            onProgressChange={setCompletionPercentage}
            onComplete={(nextAnswers) => {
              setAnswers(nextAnswers);
              setCompletionPercentage(100);
              setStep("results");
            }}
          />
        )}
        {step === "results" && answers && (
          <Results
            answers={answers}
            participant={participant}
            onRestart={() => {
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
