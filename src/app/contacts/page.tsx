"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, buyingRoleLabel } from "@/components/ui";
import { EmptyState, SkeletonList, useToast } from "@/components/ux";
import { Modal, Field, SelectField, PrimaryButton } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[] | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/contacts").then((r) => r.json()).then((d) => setContacts(d.contacts ?? []));
    fetch("/api/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
  }, []);
  useEffect(load, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <PrimaryButton onClick={() => setCreating(true)}>+ New contact</PrimaryButton>
      </div>

      {contacts === null ? (
        <SkeletonList rows={4} />
      ) : contacts.length === 0 ? (
        <EmptyState icon="👤" title="No contacts yet" hint="Add the people involved in your deals." />
      ) : (
        <div className="grid gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {[c.title, c.account?.name, c.email].filter(Boolean).join(" · ") || "No details"}
                </div>
              </div>
              {c.buyingRole && <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[11px] text-indigo-300">{buyingRoleLabel(c.buyingRole)}</span>}
            </Card>
          ))}
        </div>
      )}

      {creating && <ContactForm companies={companies} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function ContactForm({ companies, onClose, onCreated }: { companies: any[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [accountId, setAccountId] = useState("");
  const [buyingRole, setBuyingRole] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, title, accountId: accountId || undefined, buyingRole: buyingRole || undefined }),
    });
    setBusy(false);
    if (res.ok) { toast("Contact added"); onCreated(); }
    else { const e = await res.json(); toast(e.error ?? "Could not add contact", "error"); }
  }

  return (
    <Modal title="New contact" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name" value={name} onChange={setName} placeholder="Dana Whitfield" required autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" value={title} onChange={setTitle} placeholder="VP of Sales" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="dana@acme.com" />
        </div>
        <SelectField label="Company" value={accountId} onChange={setAccountId} options={[{ value: "", label: "No company" }, ...companies.map((c) => ({ value: c.id, label: c.name }))]} />
        <SelectField label="Buying role" value={buyingRole} onChange={setBuyingRole} options={BUYING_ROLES} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-edge px-4 py-2 text-sm text-gray-300 hover:bg-edge">Cancel</button>
          <PrimaryButton type="submit" disabled={busy || !name.trim()}>{busy ? "Adding…" : "Add contact"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
