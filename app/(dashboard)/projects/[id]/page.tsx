"use client";

import { use, useState, useEffect } from "react";
import { Omnibar } from "@frontend/components/ui/Omnibar";
import { LifecycleLog } from "@frontend/components/ui/LifecycleLog";
import { DataStreamPanel } from "@frontend/components/ui/DataStreamPanel";
import { useRouter } from "next/navigation";
import { Zap, Copy, Check } from "lucide-react";

export default function ProjectMemoryInterface({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Mock data mapping
  const projects: Record<string, string> = {
    "1": "ContextOS Core Build",
    "2": "Marketing Strategy",
    "3": "Q3 Fundraising"
  };
  
  const projectName = projects[resolvedParams.id] || "Unknown Memory Core";

  useEffect(() => {
    // Delay mounting the HTML HUD slightly to sync with the camera arriving in the 3D scene
    const timer = setTimeout(() => setIsMounted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'improve()', message: 'enriching graph structure with new LLM pass' } 
    }));
  };

  const handleCopyPrompt = () => {
    setCopied(true);
    // Simulate generation delay
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'recall()', message: 'generating structured continuation prompt' } 
    }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full h-full absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Back to Hub button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-12 right-12 z-50 pointer-events-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors"
      >
        [ Return to Hub ]
      </button>

      {/* Persistent Project HUD Overlay */}
      <div className="absolute top-12 left-12 z-10 pointer-events-auto">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#FF4D67] shadow-[0_0_12px_rgba(255,77,103,0.8)] animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/50">Immersive Memory Mode</span>
        </div>
        
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-light tracking-tight text-white/90">
            {projectName}
          </h1>
          
          {/* PRD Actions: Refresh (improve) & Copy Prompt */}
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={handleRefresh}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all"
              title="Refresh Memory (improve)"
            >
              <Zap className="w-4 h-4 text-white/50 group-hover:text-purple-400" />
            </button>
            <button 
              onClick={handleCopyPrompt}
              className="group flex items-center gap-2 pl-3 pr-4 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all"
              title="Copy Continuation Prompt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/50 group-hover:text-emerald-400" />}
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 group-hover:text-white">Copy Context</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-6">
          <div className="text-xs font-mono text-white/40 uppercase tracking-widest"><strong className="text-white">142</strong> Nodes</div>
          <div className="text-xs font-mono text-white/40 uppercase tracking-widest"><strong className="text-white">1,024</strong> Edges</div>
        </div>
      </div>
      
      {/* Right Side: Data Stream Panel (Decisions, Tasks, Risks + Archive) */}
      <DataStreamPanel />

      {/* Bottom Left: Terminal Action Log */}
      <LifecycleLog />

      {/* Controls Hint HUD */}
      <div className="absolute bottom-12 right-12 z-10 text-right pointer-events-none">
        <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-2">Navigation Controls</div>
        <div className="text-xs text-white/60">Orbit: Left Click + Drag</div>
        <div className="text-xs text-white/60">Zoom: Scroll</div>
        <div className="text-xs text-white/60">Pan: Right Click + Drag</div>
      </div>

      {/* Command Node HUD (Omnibar) fixed to bottom center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 pointer-events-auto">
        <Omnibar />
      </div>
    </div>
  );
}
