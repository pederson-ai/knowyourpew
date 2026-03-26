"use client";

export default function DeleteAllButton() {
  return (
    <form
      action="/api/admin/delete-all"
      method="POST"
      className="mt-4"
      onSubmit={(event) => {
        if (!window.confirm("Delete all submissions? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="w-full rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700"
      >
        Delete All
      </button>
    </form>
  );
}
