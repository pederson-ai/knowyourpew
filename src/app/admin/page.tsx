import Link from "next/link";
import { cookies } from "next/headers";
import DeleteAllButton from "@/components/DeleteAllButton";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "knowyourpew-admin";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getTopThreeGifts(
  giftScores: Array<{
    giftName: string;
    score: number;
  }>,
) {
  return [...giftScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((gift) => `${gift.giftName} (${gift.score})`)
    .join(", ");
}

function getGiftDistribution(
  submissions: Array<{
    giftScores: Array<{
      giftName: string;
      score: number;
    }>;
  }>,
) {
  const counts = new Map<string, number>();

  submissions.forEach((submission) => {
    const topGift = [...submission.giftScores].sort((a, b) => b.score - a.score)[0];
    if (topGift) {
      counts.set(topGift.giftName, (counts.get(topGift.giftName) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([giftName, count]) => ({ giftName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get(ADMIN_COOKIE)?.value === process.env.ADMIN_PASSWORD;

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-blue-950">Admin password not configured</h1>
          <p className="mt-3 text-slate-600">Set ADMIN_PASSWORD in .env to unlock the dashboard.</p>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Admin Access</p>
          <h1 className="mt-2 text-3xl font-bold text-blue-950">KnowYourPew dashboard</h1>
          <p className="mt-3 text-slate-600">Enter the admin password to view assessment submissions.</p>
          {params.error === "invalid-password" && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">That password did not match.</p>
          )}
          <form action="/api/admin/login" method="POST" className="mt-6 flex flex-col gap-4">
            <label className="text-sm font-semibold text-blue-950">
              Password
              <input
                name="password"
                type="password"
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  const query = params.q?.trim() || "";
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

  const submissionCount = submissions.length;
  const giftDistribution = getGiftDistribution(submissions);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Admin Dashboard</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-blue-950">Assessment submissions</h1>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                {submissionCount} total
              </span>
            </div>
            <p className="mt-2 text-slate-600">View names, classes, and each man&apos;s top spiritual gifts.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form className="flex flex-1 gap-3" method="GET">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by name or class"
                className="w-full min-w-0 rounded-2xl border border-amber-200 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              <button
                type="submit"
                className="rounded-2xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
              >
                Search
              </button>
            </form>
            <Link
              href={`/admin/export${query ? `?q=${encodeURIComponent(query)}` : ""}`}
              className="rounded-2xl border border-blue-200 px-5 py-3 text-center font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              Export CSV
            </Link>
          </div>
        </div>

        {params.deleted === "1" && (
          <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            All submissions were deleted.
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Submission Count</div>
            <div className="mt-2 text-4xl font-bold text-blue-950">{submissionCount}</div>
            <p className="mt-2 text-sm text-slate-600">{query ? "Matching the current search filter." : "Total responses saved so far."}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Testing Reset</div>
                <p className="mt-2 text-sm text-slate-600">Clear all saved submissions before the event if you need a fresh slate.</p>
              </div>
            </div>
            <DeleteAllButton />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-950">Top gift distribution</h2>
              <p className="text-sm text-slate-600">The most common top-ranked gifts across all saved submissions.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {giftDistribution.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500 sm:col-span-2 xl:col-span-4">
                No distribution data yet.
              </div>
            ) : (
              giftDistribution.map((gift) => (
                <div key={gift.giftName} className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-600">Top Gift</div>
                  <div className="mt-2 text-lg font-bold text-blue-950">{gift.giftName}</div>
                  <div className="mt-1 text-sm text-slate-600">{gift.count} submission{gift.count === 1 ? "" : "s"}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-blue-950 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Sunday School Class</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Top 3 Gifts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission: (typeof submissions)[number]) => (
                    <tr key={submission.id} className="align-top">
                      <td className="px-4 py-4 font-semibold text-blue-950">{submission.name}</td>
                      <td className="px-4 py-4 text-slate-700">{submission.email}</td>
                      <td className="px-4 py-4 text-slate-700">{submission.phone || "—"}</td>
                      <td className="px-4 py-4 text-slate-700">{submission.sundaySchoolClass || "—"}</td>
                      <td className="px-4 py-4 text-slate-700">{formatDate(submission.createdAt)}</td>
                      <td className="px-4 py-4 text-slate-700">{getTopThreeGifts(submission.giftScores)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
