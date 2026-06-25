"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface Me {
  user: { id: string; name: string; email: string; role: string } | null;
  workspace?: { id: string; name: string };
}

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/deals", label: "Deals" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
];

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe);
  }, [path]);

  // Hide the nav on the login screen.
  if (path === "/login") return null;

  return (
    <header className="border-b border-edge bg-panel backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded bg-indigo-500 text-sm font-bold text-white">N</span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-semibold tracking-tight">Nudge</span>
            <span className="text-[10px] text-gray-500">by NuStack</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
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
          <ThemeToggle />
          {me?.user && (
            <UserMenu
              name={me.user.name}
              email={me.user.email}
              onLogout={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
            />
          )}
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ name, email, onLogout }: { name: string; email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="relative ml-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-full bg-indigo-500/30 text-xs font-medium text-indigo-200 hover:bg-indigo-500/40"
        title={name}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-edge bg-panel p-1 shadow-xl">
          <div className="px-3 py-2">
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
          <div className="my-1 border-t border-edge" />
          <button onClick={onLogout} className="block w-full rounded px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-edge">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
