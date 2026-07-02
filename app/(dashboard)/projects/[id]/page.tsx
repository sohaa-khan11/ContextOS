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
  const [projectName, setProjectName] = useState("Loading...");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const projectId = resolvedParams.id;

  useEffect(() => {
    // Fetch project
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
          if (data.name) setProjectName(data.name);
          else setProjectName("Unknown Memory Core");
      })
      .catch(() => setProjectName("Unknown Memory Core"));

    const timer = setTimeout(() => setIsMounted(true), 1500);
    return () => clearTimeout(timer);
  }, [projectId]);

  const handleRefresh = async () => {
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'improve()', message: 'enriching graph structure with new LLM pass' } 
    }));
    try {
        await fetch(`/api/projects/${projectId}/improve`, { method: 'POST' });
        document.dispatchEvent(new CustomEvent('lifecycle-log', { 
          detail: { action: 'improve()', message: 'graph enrichment complete' } 
        }));
    } catch (e) {
        console.error(e);
    }
  };

  const handleCopyPrompt = async () => {
    setCopied(true);
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'recall()', message: 'generating structured continuation prompt' } 
    }));
    
    try {
        const res = await fetch(`/api/projects/${projectId}/continuation-prompt`, { method: 'POST' });
        const data = await res.json();
        if (data.prompt) {
            await navigator.clipboard.writeText(data.prompt);
            document.dispatchEvent(new CustomEvent('lifecycle-log', { 
              detail: { action: 'success', message: 'prompt copied to clipboard' } 
            }));
        }
    } catch (e) {
        console.error(e);
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    document.dispatchEvent(new CustomEvent('lifecycle-log', { 
      detail: { action: 'forget()', message: 'initiating complete project wipe' } 
    }));
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      
      document.dispatchEvent(new CustomEvent('lifecycle-log', { 
        detail: { action: 'success', message: 'project deleted successfully' } 
      }));
      router.push('/');
    } catch (e: any) {
      console.error(e);
      alert(`Error deleting project: ${e.message}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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
        
        {showDeleteConfirm ? (
          <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl p-6 mt-2 max-w-md animate-in fade-in slide-in-from-left-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Delete Project?</h2>
            <p className="text-sm text-red-200/70 mb-6">
              This will permanently delete all memories, Cognee dataset, graph, tasks, decisions, and metadata. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-light tracking-tight text-white/90">
              {projectName}
            </h1>
            
            {/* PRD Actions: Refresh (improve) & Copy Prompt & Delete */}
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
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all ml-2"
                title="Delete Project"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-red-400"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-6">
          <div className="text-xs font-mono text-white/40 uppercase tracking-widest"><strong className="text-white">---</strong> Nodes</div>
          <div className="text-xs font-mono text-white/40 uppercase tracking-widest"><strong className="text-white">---</strong> Edges</div>
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
