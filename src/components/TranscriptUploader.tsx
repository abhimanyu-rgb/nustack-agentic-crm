"use client";

import { useState } from "react";

const SAMPLE = `AE: Thanks for making time. Last we spoke you mentioned forecasting was painful.
Buyer (Dana, VP of Sales): Yeah. Our forecast reviews take two days every week and we still don't trust the numbers.
AE: What would a good solution need to do?
Buyer: We need it to integrate with our CRM and improve forecast accuracy. Those are the decision criteria for us.
AE: Makes sense. Who else should be involved?
Buyer: I'll bring in our RevOps lead. I own the budget for this, but we haven't allocated budget for this yet.
AE: Understood. Shall we set up a technical review?
Buyer: Let's do the technical review next Tuesday. I'll invite the RevOps lead.
AE: Perfect, I'll send the integration overview doc before then.`;

export function TranscriptUploader({ dealId, onProcessed }: { dealId: string; onProcessed: (r: unknown) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ summary: string; newSignals: { title: string }[]; scoresBefore: Record<string, number>; scoresAfter: Record<string, number>; proposal?: { rationale: string } } | null>(null);

  async function process() {
    setBusy(true);
    const res = await fetch(`/api/deals/${dealId}/transcript`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transcript: text }),
    }).then((r) => r.json());
    setResult(res);
    setBusy(false);
    onProcessed(res);
  }

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-300">Process meeting transcript</h3>
        <button onClick={() => setText(SAMPLE)} className="text-xs text-indigo-400 hover:underline">
          Load sample
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Paste a call/meeting transcript…"
        className="w-full rounded border border-edge bg-canvas p-2 text-sm outline-none focus:border-indigo-500"
      />
      <button
        disabled={busy || !text.trim()}
        onClick={process}
        className="mt-2 rounded bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
      >
        {busy ? "Running agents…" : "Extract → Score → Propose"}
      </button>

      {result && (
        <div className="mt-3 rounded border border-edge bg-canvas p-3 text-xs">
          <div className="text-gray-300">{result.summary}</div>
          <div className="mt-2 text-gray-400">
            Extracted {result.newSignals?.length ?? 0} signal(s):{" "}
            {result.newSignals?.map((s) => s.title).join(", ") || "none"}
          </div>
          {result.proposal && (
            <div className="mt-2 text-indigo-300">New stage proposal: {result.proposal.rationale}</div>
          )}
          <div className="mt-1 text-gray-500">Scores recalculated — see panel above.</div>
        </div>
      )}
    </div>
  );
}
