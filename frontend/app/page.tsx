"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import InputScanner from "@/components/cockpit/InputScanner";
import ResultsDisplay from "@/components/cockpit/ResultsDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { saveGoal, getRecentGoals, deleteGoal } from "./actions";

type Language = "en" | "am";

interface HistoryItem {
  id: string;
  original: string;
  createdAt: string;
  steps: string[];
  complexity: number;
}

type ServerGoal = {
  id: string;
  original: string;
  createdAt?: string | Date;
  steps?: string[];
  complexity?: number;
};

const MAX_HISTORY = 15;

const LANGUAGE_COPY = {
  en: {
    tagline: "TACTICAL DECOMPOSITION ENGINE",
    placeholder: "ENTER TARGET OBJECTIVE...",
    ctaLabel: "INITIALIZE BREAKDOWN",
    loadingLabel: "PROCESSING...",
    reset: "[ RESET_SYSTEM ]",
    resultsHeading: "MISSION_PARAMETERS_DECODED",
    complexityLabel: "COMPLEXITY_INDEX",
    subLoading: "GENERATING_TACTICAL_SUBROUTINES...",
    history: {
      label: "RECENT_OPERATIONS",
      empty: "NO_DATA_FOUND // AWAITING_INPUT",
      hint: "Swipe or tap [x] to delete",
      toggle: "History",
      delete: "Delete entry",
      expand: "Show breakdown",
      collapse: "Hide breakdown",
      complexity: "Complexity",
    },
    status: {
      system: "SYSTEM: ONLINE",
      secure: "[ SECURE_CONN ]",
      db: "DB: CONNECTED",
      latency: "LATENCY",
      latencyUnknown: "--",
    },
  },
  am: {
    tagline: "የስትራቴጂ መከፋፈያ ስርዓት",
    placeholder: "የመተኮር ግብ ያስገቡ...",
    ctaLabel: "ትንታኔ ይጀምሩ",
    loadingLabel: "በሂደት ላይ...",
    reset: "[ ስርዓቱን ዳግም አስጀምር ]",
    resultsHeading: "የተግባር መሪ መረጃ",
    complexityLabel: "የችግኝ መለኪያ",
    subLoading: "ንዑስ ተግባሮች በመፍጠር ላይ...",
    history: {
      label: "የቅርብ ተግባሮች",
      empty: "መረጃ አልተገኘም // ግብ ይጻፉ",
      hint: "[x] ን በመጫን ያጥፉ",
      toggle: "ታሪክ",
      delete: "መዝገቡን አጥፉ",
      expand: "መከፋፈያውን አሳይ",
      collapse: "መከፋፈያውን ዝጋ",
      complexity: "የችግኝ መለኪያ",
    },
    status: {
      system: "ሲስተም፡ ተግባራዊ",
      secure: "[ የተጠበቀ ግንኙነት ]",
      db: "ዳታ ቤዝ፡ ተገናኝቷል",
      latency: "መዘግየት",
      latencyUnknown: "--",
    },
  },
} as const;

type HistoryCopy = (typeof LANGUAGE_COPY)[Language]["history"];
type StatusCopy = (typeof LANGUAGE_COPY)[Language]["status"];

const formatHistoryDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

interface HistoryListProps {
  items: HistoryItem[];
  copy: HistoryCopy;
  onDelete: (id: string) => Promise<void>;
  scrollClassName?: string;
}

function HistoryList({ items, copy, onDelete, scrollClassName }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollArea className={`${scrollClassName ?? "max-h-[22rem]"} pr-3`}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">
            {copy.empty}
          </div>
        ) : (
          items.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatHistoryDate(item.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => { void onDelete(item.id); }}
                    className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-sm text-slate-500 hover:text-cyan-500 hover:border-cyan-500 transition-colors"
                    aria-label={copy.delete}
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                  {item.original}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? copy.collapse : copy.expand}
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {copy.complexity}: {item.complexity}/10
                  </span>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {(item.steps ?? []).map((step, index) => (
                        <li key={`${item.id}-step-${index}`} className="flex gap-2">
                          <span className="text-cyan-500 font-mono">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1} {"//"}
                          </span>
                          <span className="flex-1 leading-relaxed">{step}</span>
                        </li>
                      ))}
                      {(!item.steps || item.steps.length === 0) && (
                        <li className="text-[11px] text-slate-500 font-mono">——</li>
                      )}
                    </ol>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}

interface StatusOverlayProps {
  copy: StatusCopy;
  latencyMs: number | null;
}

function DesktopStatus({ copy, latencyMs }: StatusOverlayProps) {
  const latencyText = latencyMs !== null ? `${latencyMs}ms` : copy.latencyUnknown;
  return (
    <>
      <div className="hidden md:flex fixed top-8 left-8 z-40 text-xs text-cyan-600 dark:text-cyan-500 border border-cyan-500/30 px-2 py-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur items-center gap-2">
        <span className="animate-pulse">●</span>
        {copy.system}
      </div>
      <div className="hidden md:flex fixed bottom-8 left-8 z-40 text-xs text-slate-500 dark:text-slate-400 font-mono">
        {copy.db}
      </div>
      <div className="hidden md:flex fixed bottom-8 right-8 z-40 text-xs text-slate-500 dark:text-slate-400 font-mono">
        {copy.latency}: {latencyText}
      </div>
    </>
  );
}

function MobileStatus({ copy, latencyMs }: StatusOverlayProps) {
  const latencyText = latencyMs !== null ? `${latencyMs}ms` : copy.latencyUnknown;
  return (
    <div className="md:hidden w-full mt-6 flex flex-wrap justify-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
      <span>{copy.system}</span>
      <span>{copy.secure}</span>
      <span>{copy.db}</span>
      <span>
        {copy.latency}: {latencyText}
      </span>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ steps: string[]; complexity: number } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const copy = useMemo(() => LANGUAGE_COPY[language], [language]);

  const loadHistory = useCallback(async () => {
    const goals = (await getRecentGoals()) as ServerGoal[];
    const normalized = (goals ?? []).map((goal) => {
      const createdDate = goal.createdAt ? new Date(goal.createdAt) : new Date();
      return {
        id: goal.id,
        original: goal.original,
        createdAt: Number.isNaN(createdDate.getTime()) ? new Date().toISOString() : createdDate.toISOString(),
        steps: Array.isArray(goal.steps) ? goal.steps : [],
        complexity: typeof goal.complexity === "number" ? goal.complexity : 0,
      };
    });
    setHistory(normalized.slice(0, MAX_HISTORY));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("goalbreaker-lang") : null;
    if (stored === "am" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("goalbreaker-lang", language);
    }
  }, [language]);

  useEffect(() => {
    let isCancelled = false;

    const measureLatency = async () => {
      const started = performance.now();
      try {
        await fetch("http://localhost:8000/");
        if (!isCancelled) {
          setLatencyMs(Math.round(performance.now() - started));
        }
      } catch (error) {
        console.error("Failed to measure latency", error);
        if (!isCancelled) {
          setLatencyMs(null);
        }
      }
    };

    measureLatency();
    const intervalId = window.setInterval(measureLatency, 30000);
    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleBreakdown = async (goal: string) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, language }),
      });
      const data = await response.json();
      setResult(data);

      await saveGoal(goal, data.steps, data.complexity);
      await loadHistory();
    } catch (error) {
      console.error("Failed to fetch breakdown", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const response = await deleteGoal(id);
    if (response?.success) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const historyToggleLabel = `${copy.history.toggle} ${isMobileHistoryOpen ? "▲" : "▼"}`;
  const desktopHistoryHeight = "min(34rem, calc(100vh - 240px))";

  return (
    <div className="flex flex-col items-center w-full max-w-6xl px-4 py-6 md:py-12 min-h-screen pb-32 md:pb-0">
      <DesktopStatus copy={copy.status} latencyMs={latencyMs} />

      <div className="hidden md:flex fixed top-6 right-6 z-40 items-center gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono">
          {copy.status.secure}
        </div>
        <LanguageToggle language={language} onChange={setLanguage} />
        <ThemeToggle className="border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70" />
      </div>

      <div className="md:hidden fixed top-4 right-4 z-40 flex gap-2">
        <LanguageToggle language={language} onChange={setLanguage} />
        <ThemeToggle className="border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70" />
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-8 min-h-[65vh] md:min-h-[calc(100vh-360px)]">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white mb-2">
            GOAL_BREAKER<span className="text-cyan-600 dark:text-cyan-500">.EXE</span>
          </h1>
          <p className="text-slate-500 tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm font-mono">
            {copy.tagline}
          </p>
        </div>

        <MobileStatus copy={copy.status} latencyMs={latencyMs} />

        {!result && (
          <InputScanner
            onSubmit={handleBreakdown}
            isLoading={isLoading}
            placeholder={copy.placeholder}
            ctaLabel={copy.ctaLabel}
            loadingLabel={copy.loadingLabel}
            language={language}
          />
        )}

        {result && (
          <ResultsDisplay
            steps={result.steps}
            complexity={result.complexity}
            language={language}
            labels={{
              heading: copy.resultsHeading,
              complexity: copy.complexityLabel,
              subLoading: copy.subLoading,
            }}
          />
        )}

        {result && (
          <button
            onClick={() => setResult(null)}
            className="mt-8 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-500 text-xs md:text-sm tracking-widest transition-colors font-mono"
          >
            {copy.reset}
          </button>
        )}
      </div>

      <div className="hidden md:block w-full mt-8 pt-6 border-t border-slate-200 dark:border-slate-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-wider">
            {copy.history.label}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{copy.history.hint}</span>
        </div>
        <div
          className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 p-6"
          style={{ height: desktopHistoryHeight }}
        >
          <HistoryList
            items={history}
            copy={copy.history}
            onDelete={handleDeleteHistory}
            scrollClassName="h-full"
          />
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-900 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur">
        <button
          type="button"
          className="w-full py-3 text-xs font-mono tracking-widest text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
          onClick={() => setIsMobileHistoryOpen((prev) => !prev)}
        >
          {historyToggleLabel}
        </button>
        <div
          className={`px-4 pb-4 transition-[max-height] duration-300 overflow-hidden ${isMobileHistoryOpen ? "max-h-[70vh]" : "max-h-0"}`}
        >
          <div className="h-[60vh]">
            <HistoryList
              items={history}
              copy={copy.history}
              onDelete={handleDeleteHistory}
              scrollClassName="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
