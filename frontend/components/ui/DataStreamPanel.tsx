"use client";

import { useState, useEffect } from "react";
import { X, Network, AlertTriangle, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

type DataItem = {
  id: string;
  type: "decision" | "risk" | "task";
  content: string;
};

export function DataStreamPanel() {
  const params = useParams();
  const projectId = params.id as string;
  const [items, setItems] = useState<DataItem[]>([]);
  const [activeTab, setActiveTab] = useState<"decision" | "risk" | "task">("decision");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          if (!projectId) return;
          setIsLoading(true);
          try {
              const res = await fetch(`/api/projects/${projectId}`);
              const data = await res.json();
              if (data && data.decisions) {
                  // format items
                  const formatted = [
                      ...(data.decisions || []).map((d: any, i: number) => ({ id: `d${i}`, type: 'decision', content: d.content || d })),
                      ...(data.tasks || []).map((t: any, i: number) => ({ id: `t${i}`, type: 'task', content: t.content || t })),
                      ...(data.risks || []).map((r: any, i: number) => ({ id: `r${i}`, type: 'risk', content: r.content || r }))
                  ];
                  setItems(formatted);
              }
          } catch (e) {
              console.error(e);
          } finally {
              setIsLoading(false);
          }
      };
      fetchData();
      
      const onMemoryUpdated = () => fetchData();
      document.addEventListener('memory-updated', onMemoryUpdated);
      return () => document.removeEventListener('memory-updated', onMemoryUpdated);
  }, [projectId]);

  const handleArchive = async (id: string, type: string) => {
    // Fire the forget lifecycle event for the HUD log
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'forget()', message: `archived ${type} node ${id}` } 
    }));
    
    try {
        await fetch(`/api/projects/${projectId}/forget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ node_id: id })
        });
    } catch (e) {
        console.error("Failed to forget node", e);
    }
    
    // Remove from UI
    setItems(items.filter(item => item.id !== id));
    
    // Trigger memory refresh event so graph and HUD counters update
    document.dispatchEvent(new CustomEvent('memory-updated'));
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
                  {(() => {
                    const content = item.content;
                    const metaMatch = content.match(/\[Captured from: (.*?)\]/);
                    if (!metaMatch) {
                      return <p className="text-sm font-light text-white/80 leading-relaxed pr-6">{content}</p>;
                    }
                    
                    const cleanContent = content.replace(/\[Captured from: .*?\]/, '').trim();
                    const metaStr = metaMatch[1];
                    const domainMatch = metaStr.match(/domain: ([^\s]+)/);
                    const timestampMatch = metaStr.match(/timestamp: ([^\s\]]+)/);
                    
                    const domain = domainMatch ? domainMatch[1] : 'unknown';
                    let timeStr = 'recently';
                    if (timestampMatch) {
                      try {
                          timeStr = new Date(timestampMatch[1]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      } catch (e) {}
                    }

                    return (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-light text-white/80 leading-relaxed pr-6">{cleanContent}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40 tracking-wider uppercase">
                            {domain}
                          </span>
                          <span className="text-[9px] font-mono text-white/30 tracking-wider uppercase">
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  
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
