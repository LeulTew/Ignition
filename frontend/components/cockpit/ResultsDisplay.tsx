"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface ResultsDisplayProps {
  steps: string[];
  complexity: number;
  language: "en" | "am";
  labels: {
    heading: string;
    complexity: string;
    subLoading: string;
  };
}

export default function ResultsDisplay({ steps, complexity, language, labels }: ResultsDisplayProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [subSteps, setSubSteps] = useState<Record<number, string[]>>({});
  const [loadingSub, setLoadingSub] = useState<number | null>(null);

  useEffect(() => {
    setExpandedStep(null);
    setSubSteps({});
  }, [language]);

  const handleExpand = async (index: number, step: string) => {
    if (expandedStep === index) {
      setExpandedStep(null);
      return;
    }

    setExpandedStep(index);

    if (!subSteps[index]) {
      setLoadingSub(index);
      try {
        const response = await fetch("http://localhost:8000/sub-breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, language }),
        });
        const data = await response.json();
        setSubSteps(prev => ({ ...prev, [index]: data.substeps }));
        soundManager.playSubroutineSound();
      } catch (error) {
        console.error("Failed to fetch sub-breakdown", error);
      } finally {
        setLoadingSub(null);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mt-10 md:mt-12 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl text-cyan-600 dark:text-cyan-400 tracking-[0.4em] md:tracking-widest font-bold text-center md:text-left">{labels.heading}</h2>
        <Badge variant="outline" className="self-center border-cyan-500 text-cyan-600 dark:text-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-[10px] md:text-xs">
          {labels.complexity}: {complexity}/10
        </Badge>
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card 
              className={`bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-0 relative overflow-hidden group hover:border-cyan-500/50 transition-all ${expandedStep === index ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : ''}`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors" />
              
              <div 
                className="p-4 md:p-6 flex items-start gap-3 md:gap-4 cursor-pointer"
                onClick={() => handleExpand(index, step)}
              >
                <span className="text-cyan-600 dark:text-cyan-500 font-mono text-xs md:text-sm mt-1">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1} {"//"}
                </span>
                <div className="flex-1">
                  <p className="text-base md:text-lg font-light tracking-wide text-left">{step}</p>
                </div>
                <button className="text-slate-400 hover:text-cyan-500 transition-colors mt-1">
                  {expandedStep === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>

              <AnimatePresence>
                {expandedStep === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/50 dark:bg-black/20 border-t border-slate-200 dark:border-slate-800/50"
                  >
                    <div className="p-4 md:p-6 pt-2 md:pt-3 pl-10 md:pl-14 space-y-3">
                      {loadingSub === index ? (
                        <div className="flex items-center gap-2 text-xs text-cyan-500 animate-pulse font-mono py-2">
                          <Terminal size={12} />
                          <span>{labels.subLoading}</span>
                        </div>
                      ) : (
                        subSteps[index]?.map((sub, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-mono"
                          >
                            <span className="text-cyan-500/50">├─</span>
                            <span>{sub}</span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
