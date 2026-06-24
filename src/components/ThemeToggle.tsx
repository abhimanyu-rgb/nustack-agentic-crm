"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("nustack-theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      className="ml-1 grid h-8 w-8 place-items-center rounded-md border border-edge text-gray-400 hover:bg-edge hover:text-gray-200"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-label="Toggle color theme"
    >
      {light ? "☀" : "☾"}
    </button>
  );
}
