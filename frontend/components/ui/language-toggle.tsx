"use client";

import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  language: "en" | "am";
  onChange: (language: "en" | "am") => void;
  className?: string;
}

export function LanguageToggle({ language, onChange, className }: LanguageToggleProps) {
  const nextLanguage = language === "en" ? "am" : "en";

  return (
    <button
      type="button"
      onClick={() => onChange(nextLanguage)}
      className={cn(
        "text-[10px] font-mono tracking-widest border border-slate-300 dark:border-slate-700 px-3 py-1",
        "bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500 transition-colors",
        "rounded-sm",
        className
      )}
      aria-label={language === "en" ? "Switch to Amharic" : "Switch to English"}
    >
      {language === "en" ? "Eng" : "አማር"}
    </button>
  );
}
