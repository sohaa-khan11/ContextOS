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

const MemoryCard = ({ item, onArchive }: { item: any, onArchive: (id: string, type: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Parse the Cognee statement format
  let cleanText = item.content.replace(/\[Captured from: .*?\]/, '').trim();
  
  let type = "";
  let content = cleanText;
  let rationale = "";
  let rejected = "";
  
  const typeMatch = cleanText.match(/^([A-Z\s]+):\s*(.*?)(?=\s*RATIONALE:|\s*CONSIDERED AND REJECTED:|\s*STATUS:|\s*SOURCE:|$)/);
  if (typeMatch) {
      type = typeMatch[1];
      content = typeMatch[2];
  }
  
  const rationaleMatch = cleanText.match(/RATIONALE:\s*(.*?)(?=\s*CONSIDERED AND REJECTED:|\s*STATUS:|\s*SOURCE:|$)/);
  if (rationaleMatch) rationale = rationaleMatch[1];
  
  const rejectedMatch = cleanText.match(/CONSIDERED AND REJECTED:\s*(.*?)(?=\s*STATUS:|\s*SOURCE:|$)/);
  if (rejectedMatch) rejected = rejectedMatch[1];

  content = content.replace(/\.$/, '');
  rationale = rationale.replace(/\.$/, '');
  rejected = rejected.replace(/\.$/, '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
      className="group relative p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-colors"
    >
      <div className="pr-6">
        <h4 className="text-[13px] font-medium text-white/90 leading-snug">{content}</h4>
        
        {rationale && (
          <div className="mt-2">
            <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-wider block mb-1">Reason</span>
            <p className={`text-xs text-white/60 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
              {rationale}
            </p>
          </div>
        )}

        {expanded && rejected && (
          <div className="mt-2">
            <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider block mb-1">Alternative Rejected</span>
            <p className="text-xs text-white/60 leading-relaxed">{rejected}</p>
          </div>
        )}

        {rationale && rationale.length > 80 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-white/30 hover:text-white/60 mt-2 font-medium transition-colors"
          >
            {expanded ? "View Less" : "View More"}
          </button>
        )}
      </div>

      <button
        onClick={() => onArchive(item.id, item.type)}
        className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/20 hover:text-red-400"
        title="Archive Node (forget)"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
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
                <MemoryCard key={item.id} item={item} onArchive={handleArchive} />
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
