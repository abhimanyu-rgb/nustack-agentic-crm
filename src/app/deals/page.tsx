"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, fmtMoney, fmtDate } from "@/components/ui";
import { EmptyState, SkeletonList, useToast } from "@/components/ux";
import { Modal, Field, SelectField, PrimaryButton } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STAGES = ["Prospecting", "Qualified", "Discovery", "Solution Fit", "Business Case", "Negotiation", "Procurement / Legal"];
const FORECAST = ["PIPELINE", "BEST_CASE", "COMMIT", "OMITTED"];

export default function DealsPage() {
  const [deals, setDeals] = useState<any[] | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/deals").then((r) => r.json()).then((d) => setDeals(d.deals ?? []));
    fetch("/api/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
  }, []);
  useEffect(load, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Deals</h1>
        <PrimaryButton onClick={() => setCreating(true)}>+ New deal</PrimaryButton>
      </div>

      {deals === null ? (
        <SkeletonList rows={4} />
      ) : deals.length === 0 ? (
        <EmptyState icon="🤝" title="No deals yet" hint="Create your first deal to start tracking it." />
      ) : (
        <div className="grid gap-3">
          {deals.map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`}>
              <Card className="flex items-center justify-between p-4 transition hover:border-gray-500">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500">
                    {d.account?.name ?? "No company"} · {d.stage} · {fmtMoney(d.amount)}
                    {d.closeDate ? ` · closes ${fmtDate(d.closeDate)}` : ""}
                  </div>
                </div>
                <span className="rounded bg-edge px-2 py-0.5 text-[11px] text-gray-300">{d.status === "OPEN" ? d.forecastCategory : d.status}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {creating && (
        <DealForm companies={companies} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />
      )}
    </div>
  );
}

function DealForm({ companies, onClose, onCreated }: { companies: any[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [stage, setStage] = useState("Prospecting");
  const [amount, setAmount] = useState("");
  const [forecastCategory, setForecast] = useState("PIPELINE");
  const [closeDate, setCloseDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, accountId: accountId || undefined, stage, amount, forecastCategory, closeDate: closeDate || undefined }),
    });
    setBusy(false);
    if (res.ok) { toast("Deal created"); onCreated(); }
    else { const e = await res.json(); toast(e.error ?? "Could not create deal", "error"); }
  }

  return (
    <Modal title="New deal" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Deal name" value={name} onChange={setName} placeholder="Acme: Revenue Platform" required autoFocus />
        <SelectField label="Company" value={accountId} onChange={setAccountId} options={[{ value: "", label: "No company" }, ...companies.map((c) => ({ value: c.id, label: c.name }))]} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Stage" value={stage} onChange={setStage} options={STAGES.map((s) => ({ value: s, label: s }))} />
          <SelectField label="Forecast" value={forecastCategory} onChange={setForecast} options={FORECAST.map((f) => ({ value: f, label: f }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (USD)" type="number" value={amount} onChange={setAmount} placeholder="50000" />
          <Field label="Close date" type="date" value={closeDate} onChange={setCloseDate} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-edge px-4 py-2 text-sm text-gray-300 hover:bg-edge">Cancel</button>
          <PrimaryButton type="submit" disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create deal"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
