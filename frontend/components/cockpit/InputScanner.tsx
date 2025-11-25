"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function InputScanner({ onSubmit, isLoading }: { onSubmit: (g: string) => void, isLoading: boolean }) {
  const [goal, setGoal] = useState("");

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
          placeholder="ENTER TARGET OBJECTIVE..."
          className="w-full bg-transparent border-none text-xl p-6 text-center text-cyan-100 placeholder:text-slate-700 focus:ring-0 focus:outline-none uppercase tracking-widest"
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
        onClick={() => onSubmit(goal)}
        disabled={!goal || isLoading}
        className="w-full mt-4 bg-cyan-950/30 border border-cyan-900 text-cyan-400 py-3 hover:bg-cyan-900/50 transition-all uppercase tracking-[0.2em] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "PROCESSING..." : "INITIALIZE BREAKDOWN"}
      </button>
    </div>
  );
}
