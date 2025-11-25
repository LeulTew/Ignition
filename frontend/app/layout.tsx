import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PROJECT_BLUEPRINT // GOAL_BREAKER",
  description: "Tactical Goal Decomposition System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.className} bg-slate-950 text-slate-200 overflow-hidden selection:bg-cyan-500/30`}>
        {/* Dot Grid Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        
        {/* Corner Decorations */}
        <div className="fixed top-8 left-8 z-50 text-xs text-cyan-500 border border-cyan-500/30 px-2 py-1 bg-slate-950/80 backdrop-blur">
          <span className="animate-pulse mr-2">●</span>SYSTEM: ONLINE
        </div>
        <div className="fixed top-8 right-8 z-50 text-xs text-slate-500 border border-slate-800 px-2 py-1">
          [ SECURE_CONN ]
        </div>
        <div className="fixed bottom-8 left-8 z-50 text-xs text-slate-500 font-mono">
          DB: CONNECTED
        </div>
        <div className="fixed bottom-8 right-8 z-50 text-xs text-slate-500 font-mono">
           LATENCY: 12ms
        </div>

        <main className="relative z-10 h-screen flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
