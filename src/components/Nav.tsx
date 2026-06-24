"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandBar } from "./CommandBar";
import { ThemeToggle } from "./ThemeToggle";

interface Me {
  me: { id: string; name: string; role: string };
  canSeeAllTeam: boolean;
  users: { id: string; name: string; role: string }[];
}

export function Nav() {
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe);
  }, [path]);

  const role = me?.me.role;
  const isSdr = role === "SDR";
  // SDRs work the Outreach surface, not the AE deal queue.
  // Command + Forecast are leadership surfaces — only for all-team roles.
  const links = [
    ...(isSdr ? [] : [{ href: "/", label: "Today" }, { href: "/deals", label: "Deals" }]),
    ...(isSdr || me?.canSeeAllTeam ? [{ href: "/outreach", label: "Outreach" }] : []),
    ...(me?.canSeeAllTeam ? [{ href: "/forecast", label: "Forecast" }, { href: "/command", label: "Command" }] : []),
  ];

  return (
    <header className="border-b border-edge bg-panel backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded bg-indigo-500 text-sm font-bold text-white">N</span>
          <span className="font-semibold tracking-tight">NuStack</span>
          <span className="ml-1 rounded bg-edge px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gray-400">
            Release&nbsp;0
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:bg-edge hover:text-gray-200"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <CommandBar />
          <ThemeToggle />
          {me && <UserSwitcher me={me} />}
          <ResetButton />
        </nav>
      </div>
    </header>
  );
}

const roleLabel: Record<string, string> = {
  AE: "AE",
  SDR: "SDR",
  SALES_MANAGER: "Manager",
  REVOPS: "RevOps",
  ADMIN: "Admin",
  EXECUTIVE_VIEWER: "Exec",
};

function UserSwitcher({ me }: { me: Me }) {
  const [open, setOpen] = useState(false);
  async function switchTo(userId: string) {
    await fetch("/api/me", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    // Land each role on its home surface (SDRs have no AE Today queue).
    const target = me.users.find((u) => u.id === userId);
    window.location.href = target?.role === "SDR" ? "/outreach" : "/";
  }
  return (
    <div className="relative ml-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-edge px-3 py-1.5 text-xs text-gray-300 hover:bg-edge"
        title="Act as a different user (prototype role switcher)"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500/30 text-[10px] text-indigo-200">
          {me.me.name.split(" ").map((n) => n[0]).join("")}
        </span>
        {me.me.name.split(" ")[0]}
        <span className="rounded bg-edge px-1 text-[9px] uppercase tracking-wider text-gray-400">{roleLabel[me.me.role]}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-edge bg-panel p-1 shadow-xl">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">Act as</div>
          {me.users.map((u) => (
            <button
              key={u.id}
              onClick={() => switchTo(u.id)}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-edge ${
                u.id === me.me.id ? "text-indigo-300" : "text-gray-300"
              }`}
            >
              <span>{u.name}</span>
              <span className="rounded bg-edge px-1 text-[9px] uppercase tracking-wider text-gray-500">{roleLabel[u.role]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ResetButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/reset", { method: "POST" });
        window.location.reload();
      }}
      className="ml-1 rounded-md border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge hover:text-gray-200"
      title="Reset all demo data to the seeded state"
    >
      Reset
    </button>
  );
}
