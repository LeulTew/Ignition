"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { soundManager } from "@/lib/sounds";

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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = () => {
    if (!trimmedGoal || isLoading) {
      return;
    }
    onSubmit(trimmedGoal);
    setGoal("");
  };

  useEffect(() => {
    if (!textAreaRef.current) {
      return;
    }
    const el = textAreaRef.current;
    el.style.height = "auto";
    const maxHeight = 220;
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [goal]);

  const inputSizeClass = goal.length > 140
    ? "text-sm md:text-lg"
    : goal.length > 70
      ? "text-base md:text-xl"
      : "text-lg md:text-2xl";

  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;
    let frameId: number | null = null;
    let completeFrameId: number | null = null;

    if (isLoading) {
      soundManager.startProgressTone();
      frameId = window.requestAnimationFrame(() => setProgress(0));
      intervalId = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) {
            return prev;
          }
          return Math.min(prev + 1.5, 92);
        });
      }, 90);
    } else {
      soundManager.stopProgressTone();
      completeFrameId = window.requestAnimationFrame(() => {
        setProgress((prev) => (prev > 0 && prev < 100 ? 100 : prev));
      });
      timeoutId = window.setTimeout(() => setProgress(0), 400);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (completeFrameId) {
        window.cancelAnimationFrame(completeFrameId);
      }
      soundManager.stopProgressTone();
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
        <textarea
          ref={textAreaRef}
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
            soundManager.playTypingSound();
          }}
          disabled={isLoading}
          placeholder={placeholder}
          rows={2}
          className={`w-full bg-transparent border-none ${inputSizeClass} px-4 py-4 md:p-6 text-center text-cyan-100 placeholder:text-slate-700 focus:ring-0 focus:outline-none resize-none leading-relaxed ${language === "am" ? "tracking-wide" : "uppercase tracking-[0.32em] md:tracking-[0.4em]"}`}
          style={{ maxHeight: 220 }}
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
              className="absolute inset-y-0 left-0 rounded-sm shadow-[0_0_22px_rgba(6,182,212,0.45)]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(8,47,73,0.45), rgba(6,182,212,0.5), rgba(14,165,233,0.75))",
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${progress}%`, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-y-[2px] left-[2px] right-[2px] rounded-sm bg-gradient-to-r from-white/50 via-cyan-100/30 to-transparent opacity-60"
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
