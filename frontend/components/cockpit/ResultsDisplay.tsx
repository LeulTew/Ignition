"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultsDisplayProps {
  steps: string[];
  complexity: number;
}

export default function ResultsDisplay({ steps, complexity }: ResultsDisplayProps) {
  return (
    <div className="w-full max-w-4xl mt-12 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <h2 className="text-xl text-cyan-400 tracking-widest">MISSION_PARAMETERS_DECODED</h2>
        <Badge variant="outline" className="border-cyan-500 text-cyan-500 bg-cyan-950/20">
          COMPLEXITY_INDEX: {complexity}/10
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
            <Card className="bg-slate-900/50 border-slate-800 text-slate-300 p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors" />
              <div className="flex items-start gap-4">
                <span className="text-cyan-500 font-mono text-sm mt-1">0{index + 1} //</span>
                <p className="text-lg font-light tracking-wide">{step}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
