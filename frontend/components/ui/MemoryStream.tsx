"use client";

import { useState } from "react";
import { MemoryNode, MemoryType, MemoryStatus } from "./MemoryNode";
import { motion, AnimatePresence } from "framer-motion";
import { ListFilter } from "lucide-react";

type MemoryItem = {
  id: string;
  type: MemoryType;
  title: string;
  description: string;
  status: MemoryStatus;
  timestamp: string;
};

// Mock data
const mockMemories: MemoryItem[] = [
  {
    id: "1",
    type: "decision",
    title: "Chose FastAPI for Backend",
    description: "Needed async support and fast prototyping speed for a 7-day build.",
    status: "active",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    type: "risk",
    title: "Graph completion calls are slow",
    description: "Live demo might hang if Cognee Cloud takes > 5s.",
    status: "open",
    timestamp: "5 hours ago"
  },
  {
    id: "3",
    type: "task",
    title: "Wire up memory stream UI",
    description: "Build the fluid masonary view instead of standard tables.",
    status: "closed",
    timestamp: "1 day ago"
  },
  {
    id: "4",
    type: "decision",
    title: "No Tailwind CSS unless requested",
    description: "Adhering to system prompts to use Vanilla CSS normally, but since Tailwind is installed we leverage it.",
    status: "active",
    timestamp: "1 day ago"
  }
];

export function MemoryStream() {
  const [filter, setFilter] = useState<MemoryType | "all">("all");

  const filteredMemories = mockMemories.filter(m => filter === "all" || m.type === filter);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-medium text-white/90">Memory Stream</h3>
        
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-1">
          <ListFilter className="w-4 h-4 text-white/40 ml-2" />
          {(["all", "decision", "task", "risk"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f 
                  ? "bg-white/10 text-white" 
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-4 bottom-4 w-px bg-white/5" />
        
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((memory) => (
              <motion.div
                key={memory.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <MemoryNode {...memory} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
