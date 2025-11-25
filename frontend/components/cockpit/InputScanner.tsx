"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface InputScannerProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
  placeholder: string;
  ctaLabel: string;
  loadingLabel: string;
  language: "en" | "am";
}

export default function InputScanner({ onSubmit, isLoading, placeholder, ctaLabel, loadingLabel, language }: InputScannerProps) {
  const [goal, setGoal] = useState("");
  const [progress, setProgress] = useState(0);
  const trimmedGoal = goal.trim();

  const handleSubmit = () => {
    if (!trimmedGoal || isLoading) {
      return;
    }
    onSubmit(trimmedGoal);
    setGoal("");
  };

  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    if (isLoading) {
      setProgress(0);
      intervalId = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) {
            return prev;
          }
          return Math.min(prev + 1.5, 92);
        });
      }, 90);
    } else {
      setProgress((prev) => (prev > 0 && prev < 100 ? 100 : prev));
      timeoutId = window.setTimeout(() => setProgress(0), 400);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return (
    <div className="relative w-full max-w-2xl group">
      {/* Corner Brackets */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

      <div className="relative bg-slate-900/50 border border-slate-800 p-1 backdrop-blur-sm">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={isLoading}
          placeholder={placeholder}
          className={`w-full bg-transparent border-none text-xl p-6 text-center text-cyan-100 placeholder:text-slate-700 focus:ring-0 focus:outline-none ${language === "am" ? "tracking-wide" : "uppercase tracking-widest"}`}
        />
        
        {/* Scanning Line Animation */}
        <motion.div
          initial={{ top: 0, opacity: 0 }}
          animate={{ top: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!trimmedGoal || isLoading}
        className={`relative overflow-hidden w-full mt-4 bg-cyan-950/30 border border-cyan-900 text-cyan-400 py-3 hover:bg-cyan-900/50 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed ${language === "am" ? "tracking-wide" : "uppercase tracking-[0.2em]"}`}
      >
        <span className="relative z-10">{isLoading ? loadingLabel : ctaLabel}</span>
        {progress > 0 && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-sm shadow-[0_0_25px_#0ea5e9]"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(14,165,233,0.15), rgba(6,182,212,0.35), rgba(147,197,253,0.45))",
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${progress}%`, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-y-[2px] left-[2px] right-[2px] rounded-sm bg-[radial-gradient(circle_at_top,rgba(240,249,255,0.7),transparent)] opacity-40"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${Math.max(progress - 2, 0)}%`, opacity: 0.4 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </>
        )}
      </button>
    </div>
  );
}
