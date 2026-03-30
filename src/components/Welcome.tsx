"use client";

import React, { useMemo, useState } from "react";

type ParticipantInfo = {
  name: string;
  email: string;
  phone: string;
  sundaySchoolClass: string;
};

const classOptions = [
  "Not sure yet",
  "Adult Men",
  "Cornerstone",
  "Discipleship",
  "Foundations",
  "Journey",
  "Legacy Builders",
  "Young Families",
  "Other",
];

const shareUrl = "https://ip-172-31-84-139.tail6fba3a.ts.net:8443";

export default function Welcome({ onStart }: { onStart: (participant: ParticipantInfo) => void }) {
  const [participant, setParticipant] = useState<ParticipantInfo>({
    name: "",
    email: "",
    phone: "",
    sundaySchoolClass: "",
  });
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  const updateField = (field: keyof ParticipantInfo, value: string) => {
    setParticipant((current) => ({ ...current, [field]: value }));
  };

  const canStart = participant.name.trim() && participant.email.trim();
  const selectedClassValue = useMemo(
    () => (classOptions.includes(participant.sundaySchoolClass) ? participant.sundaySchoolClass : "Other"),
    [participant.sundaySchoolClass],
  );

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2200);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 2800);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 sm:gap-8">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-xl shadow-blue-100 sm:p-8">
        <div className="mb-4 flex items-center justify-center gap-3 text-3xl font-semibold text-blue-950 sm:text-4xl">
          <span>⛪️</span>
          <span>KnowYourPew</span>
        </div>
        <div className="mx-auto max-w-2xl text-base leading-7 text-blue-950 sm:text-lg">
          <p>
            Welcome to the Spiritual Gifts Assessment. This short survey helps you discover how God has wired you to serve at Woodridge Baptist Church.
          </p>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Answer honestly. There are no right or wrong responses, just a clearer picture of your strengths.
          </p>
        </div>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-left shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Share this assessment</p>
              <p className="mt-1 break-all text-sm text-slate-600">{shareUrl}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-amber-100"
            >
              {shareState === "copied" ? "Link Copied" : "Copy Link"}
            </button>
          </div>
          {shareState === "error" && (
            <p className="mt-2 text-sm text-rose-700">Copying did not work on this device. You can still use the link above.</p>
          )}
        </div>
      </div>

      <form
        className="w-full rounded-3xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canStart) {
            return;
          }
          onStart({
            name: participant.name.trim(),
            email: participant.email.trim(),
            phone: participant.phone.trim(),
            sundaySchoolClass:
              participant.sundaySchoolClass === "Other"
                ? ""
                : participant.sundaySchoolClass.trim(),
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-left text-sm font-semibold text-blue-950 sm:col-span-2">
            Your Name
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-amber-200 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              type="text"
              inputMode="text"
              autoComplete="name"
              autoCapitalize="words"
              value={participant.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              placeholder="Type your name"
            />
          </label>

          <label className="text-left text-sm font-semibold text-blue-950 sm:col-span-2">
            Email Address
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-amber-200 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={participant.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              placeholder="name@example.com"
            />
          </label>

          <label className="text-left text-sm font-semibold text-blue-950">
            Phone Number
            <input
              className="mt-2 min-h-12 w-full rounded-2xl border border-amber-200 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={participant.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="text-left text-sm font-semibold text-blue-950">
            Sunday School Class
            <select
              className="mt-2 min-h-12 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              value={selectedClassValue}
              onChange={(e) => updateField("sundaySchoolClass", e.target.value)}
            >
              <option value="">Select a class</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {(participant.sundaySchoolClass === "Other" ||
            (!classOptions.includes(participant.sundaySchoolClass) && participant.sundaySchoolClass !== "")) && (
            <label className="text-left text-sm font-semibold text-blue-950 sm:col-span-2">
              Enter Your Class Name
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-amber-200 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                type="text"
                inputMode="text"
                autoCapitalize="words"
                value={participant.sundaySchoolClass === "Other" ? "" : participant.sundaySchoolClass}
                onChange={(e) => updateField("sundaySchoolClass", e.target.value)}
                placeholder="Optional"
              />
            </label>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Most men finish this in about 8 to 10 minutes.</p>
          <button
            type="submit"
            className="w-full min-h-12 rounded-2xl bg-amber-400 px-5 py-3 text-base font-semibold text-blue-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200 sm:w-auto"
            disabled={!canStart}
          >
            Start Assessment
          </button>
        </div>
      </form>
    </div>
  );
}
