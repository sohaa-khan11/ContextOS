"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export default function OSDesktop() {
  const [isVisible, setIsVisible] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Hide UI when a transition starts
    const handleTransition = () => setIsVisible(false);
    
    // When returning to the hub, show UI again
    if (pathname === "/") {
      const timer = setTimeout(() => setIsVisible(true), 1500); // Wait for camera to fly back
      return () => clearTimeout(timer);
    }

    document.addEventListener('transition-start', handleTransition);
    return () => document.removeEventListener('transition-start', handleTransition);
  }, [pathname]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName })
      });
      if (res.ok) {
        const project = await res.json();
        // Fire transition event for SpatialEngine
        document.dispatchEvent(new CustomEvent('transition-start'));
        // Navigate immediately
        router.push(`/projects/${project.id}`);
      }
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`absolute top-12 left-12 z-10 transition-opacity duration-500 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/50">Neural Link Active</span>
      </div>
      <h1 className="text-5xl font-light tracking-tight text-white/90 mb-8">
        Select a <span className="font-semibold text-white">Mind.</span>
      </h1>

      {/* Create Project Flow */}
      {!isCreating ? (
        <button 
          onClick={() => setIsCreating(true)}
          className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300"
        >
          <Plus className="w-3 h-3 text-white/50 group-hover:text-emerald-400 transition-colors" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors">
            Initialize New Mind
          </span>
        </button>
      ) : (
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <input
            autoFocus
            type="text"
            placeholder="PROJECT NAME"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isLoading}
            className="w-80 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors font-light"
          />
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setProjectName(""); }}
              disabled={isLoading}
              className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-transparent rounded-xl text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading || !projectName.trim()}
              className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Create
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
