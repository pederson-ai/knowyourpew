import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-100 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">404</p>
        <h1 className="mt-3 text-3xl font-bold text-blue-950 sm:text-4xl">That page isn&apos;t here.</h1>
        <p className="mt-4 text-base text-slate-600">
          Head back to the assessment and we&apos;ll get you pointed in the right direction.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
        >
          Back to KnowYourPew
        </Link>
      </div>
    </main>
  );
}
