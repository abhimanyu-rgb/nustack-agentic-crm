"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = mode === "login" ? { email, password } : { name, email, password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded bg-indigo-500 text-base font-bold text-white">N</span>
        <span className="text-xl font-semibold tracking-tight">Nudge</span>
      </div>

      <div className="rounded-xl border border-edge bg-panel p-6">
        <h1 className="text-lg font-semibold">{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "login" ? "Welcome back. Sign in to your pipeline." : "Start tracking your leads in Nudge."}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === "signup" && (
            <Field label="Name" value={name} onChange={setName} placeholder="Abhimanyu Singh" autoFocus />
          )}
          <Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoFocus={mode === "login"} />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && <div className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          {mode === "login" ? "New to Nudge? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="text-indigo-400 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, autoFocus,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className="w-full rounded-md border border-edge bg-canvas px-3 py-2 text-sm outline-none focus:border-indigo-500"
      />
    </label>
  );
}
