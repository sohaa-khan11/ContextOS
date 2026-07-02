"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDashed, Milestone } from "lucide-react";

export type MemoryType = "decision" | "task" | "risk";
export type MemoryStatus = "open" | "closed" | "active" | "mitigated";

interface MemoryNodeProps {
  type: MemoryType;
  title: string;
  description?: string;
  status?: MemoryStatus;
  timestamp: string;
}

export function MemoryNode({ type, title, description, status, timestamp }: MemoryNodeProps) {
  const getIcon = () => {
    switch (type) {
      case "decision":
        return <Milestone className="w-5 h-5 text-purple-400" />;
      case "task":
        return status === "closed" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <CircleDashed className="w-5 h-5 text-blue-400" />
        );
      case "risk":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "decision":
        return "group-hover:border-purple-500/50";
      case "task":
        return status === "closed" ? "group-hover:border-emerald-500/50" : "group-hover:border-blue-500/50";
      case "risk":
        return "group-hover:border-amber-500/50";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "decision":
        return "bg-purple-500/10";
      case "task":
        return status === "closed" ? "bg-emerald-500/10" : "bg-blue-500/10";
      case "risk":
        return "bg-amber-500/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01 }}
      className={`group relative p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 transition-all duration-300 ${getBorderColor()}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${getBgColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">{title}</h4>
            <span className="text-xs text-white/40">{timestamp}</span>
          </div>
          
          {description && (
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          )}

          {status && (
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/50 capitalize font-medium">
                {status}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
