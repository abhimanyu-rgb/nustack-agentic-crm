import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/ux";

export const metadata: Metadata = {
  title: "Nudge · Agentic Revenue CRM by NuStack",
  description: "Nudge: a closed-loop revenue execution system that turns signals into explainable judgments and confidence-gated actions. By NuStack. (Release 0 prototype)",
};

// Set the theme class before paint to avoid a flash. Reads saved choice, else
// falls back to the OS preference.
const themeInit = `(function(){try{var t=localStorage.getItem('nustack-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <Nav />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
