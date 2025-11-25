import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      <body className={`${mono.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden selection:bg-cyan-500/30`}>
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
          
          <ThemeToggle />

          {/* Corner Decorations - Hidden on mobile */}
          <div className="hidden md:block fixed top-8 left-8 z-50 text-xs text-cyan-600 dark:text-cyan-500 border border-cyan-500/30 px-2 py-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
            <span className="animate-pulse mr-2">●</span>SYSTEM: ONLINE
          </div>
          <div className="hidden md:block fixed top-8 right-20 z-50 text-xs text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-1">
            [ SECURE_CONN ]
          </div>
          <div className="hidden md:block fixed bottom-8 left-8 z-50 text-xs text-slate-500 font-mono">
            DB: CONNECTED
          </div>
          <div className="hidden md:block fixed bottom-8 right-8 z-50 text-xs text-slate-500 font-mono">
             LATENCY: 12ms
          </div>

          <main className="relative z-10 h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden scroll-smooth">
            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="w-full py-8 text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-600 space-y-2 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-900">
              <p className="font-bold tracking-widest">IGNITION // GOAL_BREAKER.EXE</p>
              <p>Leul Tewodros Agonafer | leulman2@gmail.com | +251966235333</p>
              <div className="flex justify-center gap-4">
                 <a href="https://t.me/fabbin" target="_blank" className="hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors">Telegram: @fabbin</a>
                 <a href="https://www.linkedin.com/in/leul-t-agonafer-861bb3336/" target="_blank" className="hover:text-cyan-600 dark:hover:text-cyan-500 transition-colors">LinkedIn</a>
              </div>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
