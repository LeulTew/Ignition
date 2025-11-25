"use client";
import { useState, useEffect } from "react";
import InputScanner from "@/components/cockpit/InputScanner";
import ResultsDisplay from "@/components/cockpit/ResultsDisplay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { saveGoal, getRecentGoals } from "./actions";

interface HistoryItem {
  id: string;
  original: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ steps: string[]; complexity: number } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
    <div className="flex flex-col items-center w-full max-w-6xl px-4 py-6 md:py-12 h-full min-h-full">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        <div className="mb-8 md:mb-12 text-center space-y-2 mt-8 md:mt-0">
          <h1 className="text-3xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white mb-2">
            GOAL_BREAKER<span className="text-cyan-600 dark:text-cyan-500">.EXE</span>
          </h1>
          <p className="text-slate-500 tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm font-mono">TACTICAL DECOMPOSITION ENGINE</p>
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
             className="mt-8 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-500 text-xs md:text-sm tracking-widest transition-colors font-mono"
           >
             [ RESET_SYSTEM ]
           </button>
        )}
      </div>

      {/* History Bar */}
      <div className="w-full mt-12 md:mt-auto pt-8 border-t border-slate-200 dark:border-slate-900">
        <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-600 mb-2 ml-2 font-mono tracking-wider">RECENT_OPERATIONS</p>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 p-4">
          <div className="flex w-max space-x-4">
            {history.map((item) => (
              <div key={item.id} className="shrink-0 w-[180px] md:w-[200px] h-[50px] md:h-[60px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 flex flex-col justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer shadow-sm">
                <span className="text-[10px] text-cyan-600 dark:text-cyan-500 font-mono">OP_ID_{item.id.slice(-4).toUpperCase()}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono">{item.original}</span>
              </div>
            ))}
            {history.length === 0 && (
               <div className="text-slate-400 dark:text-slate-600 text-xs p-2 font-mono">NO_DATA_FOUND // AWAITING_INPUT</div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
