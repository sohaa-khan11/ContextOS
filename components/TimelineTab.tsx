"use client";
import { Plus, GitCommit, Play, Activity } from "lucide-react";

export function TimelineTab() {
  const events = [
    { type: "add", title: "Memory captured", desc: "Added 3 minutes ago", icon: Plus, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { type: "modify", title: "Decision made", desc: "Chose Next.js for the frontend\\n12 minutes ago", icon: GitCommit, color: "text-blue-400", bg: "bg-blue-400/10" },
    { type: "init", title: "Task created", desc: "Build extension popup\\n1 hour ago", icon: Play, color: "text-purple-400", bg: "bg-purple-400/10" }
  ];

  return (
    <div className="max-w-2xl bg-[#180e10] border border-[#2c1a1e] rounded-xl p-8 premium-shadow">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-white">Timeline</h2>
      </div>

      <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-[23px] before:w-[2px] before:bg-[#2c1a1e]">
        {events.map((ev, i) => (
          <div key={i} className="relative flex gap-6">
            <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-[#2c1a1e] ${ev.bg} mt-1 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
              <ev.icon className={`w-3 h-3 ${ev.color}`} />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">{ev.title}</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{ev.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
