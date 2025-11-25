"use client";
import { useState, useEffect } from "react";
import InputScanner from "@/components/cockpit/InputScanner";
import ResultsDisplay from "@/components/cockpit/ResultsDisplay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { saveGoal, getRecentGoals } from "./actions";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ steps: string[]; complexity: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const goals = await getRecentGoals();
    setHistory(goals);
  };

  const handleBreakdown = async (goal: string) => {
    setIsLoading(true);
    setResult(null);
    try {
      // In production, use an environment variable for the API URL
      const response = await fetch("http://localhost:8000/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await response.json();
      setResult(data);

      // Save to DB
      await saveGoal(goal, data.steps, data.complexity);
      loadHistory(); // Refresh history
    } catch (error) {
      console.error("Failed to fetch breakdown", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl px-4 py-12 h-full">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="mb-12 text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-2">
            GOAL_BREAKER<span className="text-cyan-500">.EXE</span>
          </h1>
          <p className="text-slate-500 tracking-[0.5em] text-sm">TACTICAL DECOMPOSITION ENGINE</p>
        </div>

        {!result && (
          <InputScanner onSubmit={handleBreakdown} isLoading={isLoading} />
        )}

        {result && (
          <ResultsDisplay steps={result.steps} complexity={result.complexity} />
        )}
        
        {result && (
           <button 
             onClick={() => setResult(null)}
             className="mt-8 text-slate-500 hover:text-cyan-500 text-sm tracking-widest transition-colors"
           >
             [ RESET_SYSTEM ]
           </button>
        )}
      </div>

      {/* History Bar */}
      <div className="w-full mt-auto pt-8 border-t border-slate-900">
        <p className="text-xs text-slate-600 mb-2 ml-2">RECENT_OPERATIONS</p>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex w-max space-x-4">
            {history.map((item) => (
              <div key={item.id} className="shrink-0 w-[200px] h-[60px] bg-slate-900 border border-slate-800 rounded p-2 flex flex-col justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-xs text-cyan-500">OP_ID_{item.id.slice(-4).toUpperCase()}</span>
                <span className="text-xs text-slate-400 truncate">{item.original}</span>
              </div>
            ))}
            {history.length === 0 && (
               <div className="text-slate-600 text-xs p-2">NO_DATA_FOUND</div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
