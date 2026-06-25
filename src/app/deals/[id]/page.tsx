"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card, SectionTitle, fmtMoney, fmtDate, buyingRoleLabel } from "@/components/ui";
import { SkeletonList, useToast } from "@/components/ux";
import { BackButton } from "@/components/BackButton";
import { Field, SelectField } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STAGES = ["Prospecting", "Qualified", "Discovery", "Solution Fit", "Business Case", "Negotiation", "Procurement / Legal"];
const FORECAST = ["PIPELINE", "BEST_CASE", "COMMIT", "OMITTED"];
const STATUS = ["OPEN", "WON", "LOST", "SLIPPED"];
const ACTIVITY_TYPES = ["NOTE", "EMAIL", "MEETING", "CALL", "TRANSCRIPT"];

export default function DealRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    fetch(`/api/deals/${id}`).then(async (r) => {
      if (!r.ok) return setNotFound(true);
      const d = await r.json();
      setDeal(d.deal);
    });
  }, [id]);
  useEffect(load, [load]);

  async function patch(data: any) {
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast("Saved"); load(); }
    else toast("Could not save", "error");
  }

  if (notFound) return <div><BackButton fallback="/deals" /><div className="mt-4 text-gray-500">Deal not found.</div></div>;
  if (!deal)
    return (
      <div>
        <div className="mb-4 h-7 w-72 animate-pulse rounded bg-edge" />
        <SkeletonList rows={3} />
      </div>
    );

  return (
    <div>
      <BackButton fallback="/deals" />
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-semibold">{deal.name}</h1>
        <p className="text-sm text-gray-400">
          {deal.account?.name ?? "No company"} · {fmtMoney(deal.amount)}
          {deal.closeDate ? ` · closes ${fmtDate(deal.closeDate)}` : ""}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Editable deal fields */}
        <div className="grid gap-5 lg:col-span-2">
          <Card className="p-4">
            <SectionTitle>Deal</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Stage" value={deal.stage} onChange={(v) => patch({ stage: v })} options={STAGES.map((s) => ({ value: s, label: s }))} />
              <SelectField label="Forecast" value={deal.forecastCategory} onChange={(v) => patch({ forecastCategory: v })} options={FORECAST.map((f) => ({ value: f, label: f }))} />
              <SelectField label="Status" value={deal.status} onChange={(v) => patch({ status: v })} options={STATUS.map((s) => ({ value: s, label: s }))} />
              <AmountEditor value={deal.amount} onSave={(v) => patch({ amount: v })} />
            </div>
          </Card>

          <ActivityLog dealId={id} activities={deal.activities} onLogged={load} />
        </div>

        {/* Contacts on the account */}
        <div>
          <Card className="p-4">
            <SectionTitle hint="on this company">Contacts</SectionTitle>
            {deal.account?.contacts?.length ? (
              <div className="space-y-2">
                {deal.account.contacts.map((c: any) => (
                  <div key={c.id} className="rounded border border-edge p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      {c.buyingRole && <span className="text-[10px] uppercase tracking-wider text-indigo-300">{buyingRoleLabel(c.buyingRole)}</span>}
                    </div>
                    <div className="text-xs text-gray-500">{c.title}{c.email ? ` · ${c.email}` : ""}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No contacts linked to this company yet. Add them from the Contacts tab.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AmountEditor({ value, onSave }: { value: number; onSave: (v: string) => void }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <div onBlur={() => Number(v) !== value && onSave(v)}>
      <Field label="Amount (USD)" type="number" value={v} onChange={setV} />
    </div>
  );
}

function ActivityLog({ dealId, activities, onLogged }: { dealId: string; activities: any[]; onLogged: () => void }) {
  const { toast } = useToast();
  const [type, setType] = useState("NOTE");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dealId, type, subject, body }),
    });
    setBusy(false);
    if (res.ok) { setSubject(""); setBody(""); toast("Activity logged"); onLogged(); }
    else toast("Could not log activity", "error");
  }

  return (
    <Card className="p-4">
      <SectionTitle hint={`${activities.length} logged`}>Activity</SectionTitle>
      <form onSubmit={submit} className="mb-4 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <SelectField label="Type" value={type} onChange={setType} options={ACTIVITY_TYPES.map((t) => ({ value: t, label: t.toLowerCase() }))} />
          <div className="col-span-2"><Field label="Subject" value={subject} onChange={setSubject} placeholder="Discovery call" /></div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-400">{type === "TRANSCRIPT" ? "Transcript" : "Notes"}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={type === "TRANSCRIPT" ? 5 : 3}
            placeholder={type === "TRANSCRIPT" ? "Paste the meeting transcript…" : "What happened?"}
            className="w-full rounded-md border border-edge bg-canvas px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </label>
        <button type="submit" disabled={busy || !body.trim()} className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50">
          {busy ? "Logging…" : "Log activity"}
        </button>
      </form>

      <div className="space-y-2 border-t border-edge pt-3">
        {activities.length === 0 && <p className="text-xs text-gray-500">No activity yet. Log a call, email, note or transcript above.</p>}
        {activities.map((a: any) => (
          <div key={a.id} className="border-l-2 border-edge pl-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{a.type}</span>
              {a.subject && <span className="font-medium">{a.subject}</span>}
              <span className="ml-auto text-[10px] text-gray-600">{fmtDate(a.occurredAt)}</span>
            </div>
            {a.body && <div className="mt-0.5 line-clamp-3 text-xs text-gray-400">{a.body}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}
