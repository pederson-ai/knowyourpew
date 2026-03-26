import React from "react";

export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = Math.round((value / max) * 100);

  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-amber-100">
      <div
        className="h-4 rounded-full bg-blue-900 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
