"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Command, ArrowRight, Activity, Zap, Plus, Search } from "lucide-react";

export function Omnibar() {
  const [mode, setMode] = useState<"ask" | "capture">("ask");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (mode === "ask") {
      setIsSearching(true);
      setShowResult(false);
      
      // Simulate dispatching event to LifecycleLog and SpatialEngine
      document.dispatchEvent(new CustomEvent('lifecycle-log', { detail: { action: 'recall()', message: 'executing graph-completion search' } }));
      
      setTimeout(() => {
        setIsSearching(false);
        setShowResult(true);
      }, 2000);
    } else {
      // Capture mode
      setIsSearching(true);
      document.dispatchEvent(new CustomEvent('lifecycle-log', { detail: { action: 'remember()', message: 'ingesting unstructured context' } }));
      
      setTimeout(() => {
        setIsSearching(false);
        setQuery("");
        document.dispatchEvent(new CustomEvent('lifecycle-log', { detail: { action: 'remember()', message: 'added 2 facts, 1 decision' } }));
      }, 1500);
    }
  };

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {(isSearching || showResult) && mode === "ask" && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: -24, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-0 right-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-10"
          >
            {isSearching ? (
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                <div className="text-sm font-mono tracking-widest uppercase text-white/70">
                  Routing camera to target nodes...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-mono tracking-widest uppercase text-white/50">Memory Found</h3>
                </div>
                <p className="text-xl text-white/90 leading-relaxed font-light">
                  We chose <strong className="text-primary font-medium drop-shadow-[0_0_8px_rgba(255,77,103,0.5)]">FastAPI</strong> because we needed async support and fast prototyping speed for a 7-day build.
                </p>
                
                {/* Reasoning Chain Path */}
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-semibold">Reasoning Chain</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div className="text-xs text-white/80"><span className="text-white/40 uppercase font-mono mr-2">Decision</span> Chose FastAPI</div>
                    </div>
                    <div className="pl-1 border-l border-white/10 ml-[3px] py-1">
                      <div className="flex items-center gap-3 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <div className="text-xs text-white/80"><span className="text-white/40 uppercase font-mono mr-2">Rationale</span> Needed async support</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setShowResult(false); setQuery(""); }} className="text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white/80 transition-colors pt-2">
                  [ Close HUD ]
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative group flex flex-col items-center"
      >
        <div className="absolute inset-0 bg-black/60 rounded-[32px] blur-xl" />
        
        {/* Mode Toggles */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full z-20">
          <button
            type="button"
            onClick={() => setMode("ask")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
              mode === "ask" ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "text-white/40 hover:text-white/80"
            }`}
          >
            <Search className="w-3 h-3" /> Recall
          </button>
          <button
            type="button"
            onClick={() => setMode("capture")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
              mode === "capture" ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,77,103,0.2)]" : "text-white/40 hover:text-white/80"
            }`}
          >
            <Plus className="w-3 h-3" /> Remember
          </button>
        </div>

        <div className={`relative flex items-end w-full bg-[#05010a]/80 backdrop-blur-3xl overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_40px_rgba(0,0,0,0.5)] focus-within:border-white/30 transition-all duration-500 ${mode === 'capture' ? 'rounded-3xl' : 'rounded-full'}`}>
          <div className="pl-6 pr-4 pb-5">
            <Sparkles className={`w-5 h-5 transition-colors duration-500 ${query ? (mode === 'ask' ? 'text-white' : 'text-primary') : 'text-white/20'}`} />
          </div>
          
          {mode === "ask" ? (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query the memory stream..."
              className="w-full py-5 bg-transparent text-lg font-light text-white placeholder:text-white/20 focus:outline-none tracking-wide"
            />
          ) : (
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste raw conversation context, emails, or decisions here to inject into memory..."
              className="w-full py-5 h-32 bg-transparent text-lg font-light text-white placeholder:text-white/20 focus:outline-none tracking-wide resize-none"
            />
          )}

          <div className="pr-5 pl-4 pb-4 flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">
              <Command className="w-3 h-3" /> 
              ENTER
            </kbd>
            <button 
              type="submit"
              disabled={isSearching}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                isSearching ? 'bg-white/10 text-white/30' :
                query 
                  ? mode === 'ask' 
                    ? 'bg-white text-black hover:scale-105' 
                    : 'bg-primary text-white hover:scale-105 shadow-[0_0_20px_rgba(255,77,103,0.4)]'
                  : 'bg-white/5 text-white/20'
              }`}
            >
              {isSearching ? <Activity className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
