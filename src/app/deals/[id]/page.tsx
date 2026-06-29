"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card, ScoreChip, SectionTitle, fmtMoney, fmtDate, buyingRoleLabel } from "@/components/ui";
import { SkeletonList, useToast } from "@/components/ux";
import { BackButton } from "@/components/BackButton";
import { Field, SelectField } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STAGES = ["Prospecting", "Qualified", "Discovery", "Solution Fit", "Business Case", "Negotiation", "Procurement / Legal"];
const FORECAST = ["PIPELINE", "BEST_CASE", "COMMIT", "OMITTED"];
const STATUS = ["OPEN", "WON", "LOST", "SLIPPED"];
const ACTIVITY_TYPES = ["NOTE", "EMAIL", "MEETING", "CALL", "TRANSCRIPT"];
const BUYING_ROLES = [
  { value: "", label: "No role" },
  { value: "ECONOMIC_BUYER", label: "Decision maker" },
  { value: "CHAMPION", label: "Champion" },
  { value: "TECHNICAL_BUYER", label: "Influencer (technical)" },
  { value: "PROCUREMENT", label: "Budget holder" },
  { value: "LEGAL", label: "Legal & compliance" },
  { value: "END_USER", label: "End user" },
  { value: "BLOCKER", label: "Blocker" },
];

export default function DealRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    fetch(`/api/deals/${id}`).then(async (r) => {
      if (!r.ok) return setNotFound(true);
      const d = await r.json();
      setDeal(d.deal);
      setScore(d.score);
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

      {/* Scores */}
      {score && (
        <Card className="mb-5 p-4">
          <SectionTitle hint="computed from stage, committee & activity">Deal scores</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreChip label="Health" value={deal.healthScore} />
            <ScoreChip label="Risk" value={deal.riskScore} invert />
          </div>
          <div className="mt-3 grid gap-3 border-t border-edge pt-3 text-xs sm:grid-cols-2">
            <div>
              <div className="mb-1 font-medium text-emerald-300">What's helping</div>
              {score.healthFactors.length ? score.healthFactors.map((f: any, i: number) => (
                <div key={i} className="flex justify-between text-gray-400"><span>{f.label}</span><span className="tabular-nums text-emerald-300">+{f.weight}</span></div>
              )) : <div className="text-gray-600">Nothing yet</div>}
            </div>
            <div>
              <div className="mb-1 font-medium text-rose-300">What's hurting</div>
              {score.riskFactors.length ? score.riskFactors.map((f: any, i: number) => (
                <div key={i} className="flex justify-between text-gray-400"><span>{f.label}</span><span className="tabular-nums text-rose-300">+{f.weight}</span></div>
              )) : <div className="text-gray-600">No risk factors</div>}
            </div>
          </div>
        </Card>
      )}

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

        {/* Buying committee: contacts linked directly to this deal */}
        <div>
          <BuyingCommittee dealId={id} contacts={deal.contacts ?? []} companyContacts={deal.account?.contacts ?? []} onChange={load} />
        </div>
      </div>
    </div>
  );
}

function BuyingCommittee({ dealId, contacts, companyContacts, onChange }: { dealId: string; contacts: any[]; companyContacts: any[]; onChange: () => void }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  async function unlink(contactId: string) {
    const res = await fetch(`/api/deals/${dealId}/contacts?contactId=${contactId}`, { method: "DELETE" });
    if (res.ok) { toast("Removed from deal"); onChange(); }
  }

  // Company contacts not yet on the deal (candidates to link).
  const linkedIds = new Set(contacts.map((c) => c.id));
  const linkable = companyContacts.filter((c) => !linkedIds.has(c.id));

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Buying committee</h2>
        <button onClick={() => setAdding((v) => !v)} className="text-xs text-indigo-400 hover:underline">
          {adding ? "Close" : "+ Add contact"}
        </button>
      </div>

      {contacts.length ? (
        <div className="space-y-2">
          {contacts.map((c: any) => (
            <div key={c.id} className="group rounded border border-edge p-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  {c.buyingRole && <span className="text-[10px] uppercase tracking-wider text-indigo-300">{buyingRoleLabel(c.buyingRole)}</span>}
                  <button onClick={() => unlink(c.id)} className="text-gray-600 opacity-0 transition group-hover:opacity-100 hover:text-rose-400" title="Remove from deal">✕</button>
                </div>
              </div>
              <div className="text-xs text-gray-500">{c.title}{c.email ? ` · ${c.email}` : ""}</div>
            </div>
          ))}
        </div>
      ) : (
        !adding && <p className="text-xs text-gray-500">No one on this deal yet. Add the stakeholders involved.</p>
      )}

      {adding && <AddContactToDeal dealId={dealId} linkable={linkable} onDone={() => { setAdding(false); onChange(); }} />}
    </Card>
  );
}

function AddContactToDeal({ dealId, linkable, onDone }: { dealId: string; linkable: any[]; onDone: () => void }) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"existing" | "new">(linkable.length ? "existing" : "new");
  const [contactId, setContactId] = useState(linkable[0]?.id ?? "");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [buyingRole, setBuyingRole] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = mode === "existing" ? { contactId } : { name, title, email, buyingRole: buyingRole || undefined };
    const res = await fetch(`/api/deals/${dealId}/contacts`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) { toast("Contact added to deal"); onDone(); }
    else { const e = await res.json(); toast(e.error ?? "Could not add contact", "error"); }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
      {linkable.length > 0 && (
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setMode("existing")} className={`rounded px-2 py-1 ${mode === "existing" ? "bg-indigo-500/20 text-indigo-200" : "text-gray-400"}`}>Existing</button>
          <button type="button" onClick={() => setMode("new")} className={`rounded px-2 py-1 ${mode === "new" ? "bg-indigo-500/20 text-indigo-200" : "text-gray-400"}`}>New</button>
        </div>
      )}
      {mode === "existing" ? (
        <SelectField label="Contact" value={contactId} onChange={setContactId} options={linkable.map((c) => ({ value: c.id, label: `${c.name}${c.title ? ` (${c.title})` : ""}` }))} />
      ) : (
        <>
          <Field label="Name" value={name} onChange={setName} placeholder="Dana Whitfield" required autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Title" value={title} onChange={setTitle} placeholder="VP of Sales" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="dana@acme.com" />
          </div>
          <SelectField label="Buying role" value={buyingRole} onChange={setBuyingRole} options={BUYING_ROLES} />
        </>
      )}
      <button type="submit" disabled={busy || (mode === "existing" ? !contactId : !name.trim())} className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:opacity-50">
        {busy ? "Adding…" : "Add to deal"}
      </button>
    </form>
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
