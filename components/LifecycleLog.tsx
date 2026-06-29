"use client";
import { useState } from "react";
import { Activity } from "lucide-react";

export function LifecycleLog() {
  const [log] = useState("remember(): 2 elements added");

  return (
    <div className="absolute top-6 right-6 lg:right-10 font-mono text-xs font-medium text-zinc-900 dark:text-zinc-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-md border border-zinc-200/50 dark:border-white/10 rounded-full px-4 py-2 flex items-center gap-2.5 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
        <Activity className="relative inline-flex w-2.5 h-2.5 text-zinc-900 dark:text-zinc-50" />
      </span>
      {log}
    </div>
  );
}
