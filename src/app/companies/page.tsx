"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, SectionTitle } from "@/components/ui";
import { EmptyState, SkeletonList, useToast } from "@/components/ux";
import { Modal, Field, PrimaryButton } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[] | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
  }, []);
  useEffect(load, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <PrimaryButton onClick={() => setCreating(true)}>+ New company</PrimaryButton>
      </div>

      {companies === null ? (
        <SkeletonList rows={4} />
      ) : companies.length === 0 ? (
        <EmptyState icon="🏢" title="No companies yet" hint="Add the companies you're selling into." />
      ) : (
        <div className="grid gap-3">
          {companies.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {[c.industry, c.location, c.employeeCount ? `${c.employeeCount} employees` : null].filter(Boolean).join(" · ") || "No details"}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                {c._count?.deals ?? 0} deals · {c._count?.contacts ?? 0} contacts
              </div>
            </Card>
          ))}
        </div>
      )}

      {creating && <CompanyForm onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function CompanyForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, domain, industry, location, employeeCount }),
    });
    setBusy(false);
    if (res.ok) { toast("Company added"); onCreated(); }
    else { const e = await res.json(); toast(e.error ?? "Could not add company", "error"); }
  }

  return (
    <Modal title="New company" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Company name" value={name} onChange={setName} placeholder="Acme Logistics" required autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Domain" value={domain} onChange={setDomain} placeholder="acme.com" />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Logistics" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Location" value={location} onChange={setLocation} placeholder="Chicago, IL" />
          <Field label="Employees" type="number" value={employeeCount} onChange={setEmployeeCount} placeholder="1200" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-edge px-4 py-2 text-sm text-gray-300 hover:bg-edge">Cancel</button>
          <PrimaryButton type="submit" disabled={busy || !name.trim()}>{busy ? "Adding…" : "Add company"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
