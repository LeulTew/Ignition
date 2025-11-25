import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const SOCIAL_ICONS = {
  telegram: "M21.5 2.5 2 10.2c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 2 6.4c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.6.2 1.8-.9l3.2-15.4c.3-1.1-.4-1.6-1.5-1.3Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1-.01 5.01 2.5 2.5 0 0 1 .01-5.01ZM3 9h4v12H3zM9 9h3.8v1.71h.05c.53-.99 1.82-2.04 3.74-2.04 4 0 4.74 2.63 4.74 6.05V21H18v-5.44c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.85V21h-4z",
};

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GOAL_BREAKER.EXE // IGNITION",
  description: "Tactical Goal Decomposition System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mono.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-x-hidden selection:bg-cyan-500/30`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {/* Dot Grid Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>
          
          <main className="relative z-10 min-h-screen flex flex-col items-center overflow-x-hidden scroll-smooth">
            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full mt-12 mb-20 md:mb-0 py-8 text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-600 space-y-2 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-900">
            <p className="font-bold tracking-widest">IGNITION // GOAL_BREAKER.EXE</p>
            <p>Leul Tewodros Agonafer | leulman2@gmail.com | +251966235333</p>
            <div className="flex justify-center gap-4 text-slate-500">
              <a
                href="https://t.me/fabbin"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/60 text-slate-600 hover:border-cyan-400 hover:text-cyan-500 transition-colors dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <path d={SOCIAL_ICONS.telegram} />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/leul-t-agonafer-861bb3336/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/60 text-slate-600 hover:border-cyan-400 hover:text-cyan-500 transition-colors dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <path d={SOCIAL_ICONS.linkedin} />
                </svg>
              </a>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
