"use client";

import { useState } from "react";
import { OVERRIDE_REASONS } from "./ui";

// One-click reason capture (PRD 08.6 / 10.7). Pick a reason, optional note, done.
export function ReasonPicker({
  onSubmit,
  onCancel,
}: {
  onSubmit: (reasonCode: string, note?: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  return (
    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
      <div className="mb-2 text-xs font-medium text-rose-300">Why are you rejecting this? (becomes training data)</div>
      <div className="flex flex-wrap gap-1.5">
        {OVERRIDE_REASONS.map((r) => (
          <button
            key={r.code}
            onClick={() => setReason(r.code)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              reason === r.code
                ? "border-rose-400 bg-rose-500/20 text-rose-200"
                : "border-edge text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note…"
        className="mt-2 w-full rounded border border-edge bg-canvas px-2 py-1.5 text-sm outline-none focus:border-gray-500"
      />
      <div className="mt-2 flex gap-2">
        <button
          disabled={!reason}
          onClick={() => reason && onSubmit(reason, note || undefined)}
          className="rounded bg-rose-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Confirm rejection
        </button>
        <button onClick={onCancel} className="rounded border border-edge px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200">
          Cancel
        </button>
      </div>
    </div>
  );
}
