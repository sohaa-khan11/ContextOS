"use client";

import { useState } from "react";
import { X, Network, AlertTriangle, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DataItem = {
  id: string;
  type: "decision" | "risk" | "task";
  content: string;
};

const INITIAL_DATA: DataItem[] = [
  { id: "d1", type: "decision", content: "Chose FastAPI for the backend architecture." },
  { id: "d2", type: "decision", content: "Use WebGL / Three.js for memory visualization." },
  { id: "r1", type: "risk", content: "WebGL performance on mobile Safari." },
  { id: "t1", type: "task", content: "Implement Cognee forget() lifecycle endpoint." },
];

export function DataStreamPanel() {
  const [items, setItems] = useState<DataItem[]>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<"decision" | "risk" | "task">("decision");

  const handleArchive = (id: string, type: string) => {
    // Fire the forget lifecycle event for the HUD log
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'forget()', message: `archived ${type} node ${id}` } 
    }));
    
    // Remove from UI
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-80 z-40 pointer-events-auto">
      
      {/* HUD Header & Tabs */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-4 pl-1">
          Active Knowledge Stream
        </div>
        
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab("decision")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${activeTab === 'decision' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80'}`}
          >
            <Network className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Decisions</span>
          </button>
          <button 
            onClick={() => setActiveTab("risk")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${activeTab === 'risk' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Risks</span>
          </button>
          <button 
            onClick={() => setActiveTab("task")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${activeTab === 'task' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80'}`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Tasks</span>
          </button>
        </div>

        {/* List Stream */}
        <div className="space-y-2 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-xs font-mono text-white/20 uppercase tracking-widest"
              >
                No active {activeTab}s
              </motion.div>
            ) : (
              filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                  className="group relative p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-light text-white/80 leading-relaxed pr-6">
                    {item.content}
                  </p>
                  
                  {/* Archive Button - PRD Required forget() trigger */}
                  <button
                    onClick={() => handleArchive(item.id, item.type)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-black/50 text-white/30 hover:text-red-400 hover:bg-red-400/20 transition-all"
                    title="Archive Node (forget)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Global CSS for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}} />
    </div>
  );
}
