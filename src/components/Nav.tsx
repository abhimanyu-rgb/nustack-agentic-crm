"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today" },
  { href: "/deals", label: "Deals" },
  { href: "/forecast", label: "Forecast" },
  { href: "/command", label: "Command" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-edge bg-panel/60 backdrop-blur">
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
          <ResetButton />
        </nav>
      </div>
    </header>
  );
}

function ResetButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/reset", { method: "POST" });
        window.location.reload();
      }}
      className="ml-2 rounded-md border border-edge px-3 py-1.5 text-xs text-gray-400 hover:bg-edge hover:text-gray-200"
      title="Reset all demo data to the seeded state"
    >
      Reset demo
    </button>
  );
}
