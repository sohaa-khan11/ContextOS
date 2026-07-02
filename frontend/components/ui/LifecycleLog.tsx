"use client";

import { useEffect, useState } from "react";
import { Terminal, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: string;
  action: string;
  message: string;
  timestamp: Date;
}

export function LifecycleLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Initial boot log
    setLogs([
      { id: "boot-1", action: "system", message: "ContextOS initialized", timestamp: new Date() },
      { id: "boot-2", action: "recall()", message: "loaded project memory graph", timestamp: new Date() }
    ]);

    const handleLog = (e: CustomEvent) => {
      const { action, message } = e.detail;
      setLogs((prev) => {
        const newLogs = [...prev, { id: Math.random().toString(36).substring(7), action, message, timestamp: new Date() }];
        // Keep only the last 5 logs to prevent screen clutter
        return newLogs.slice(-5);
      });
    };

    document.addEventListener("lifecycle-log", handleLog as EventListener);
    return () => document.removeEventListener("lifecycle-log", handleLog as EventListener);
  }, []);

  return (
    <div className="absolute bottom-12 left-12 z-40 w-80 pointer-events-none">
      <div className="flex items-center gap-2 mb-3 opacity-50">
        <Terminal className="w-3 h-3 text-white" />
        <span className="text-[10px] font-mono tracking-widest text-white uppercase">Lifecycle Stream</span>
      </div>
      
      <div className="flex flex-col gap-1.5 justify-end h-32 overflow-hidden mask-image:linear-gradient(to_bottom,transparent,black_20%)">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2 text-xs font-mono"
            >
              <span className="text-white/30 shrink-0 mt-[1px]">›</span>
              <span className={`shrink-0 ${
                log.action === 'remember()' ? 'text-emerald-400' :
                log.action === 'recall()' ? 'text-blue-400' :
                log.action === 'improve()' ? 'text-purple-400' :
                log.action === 'forget()' ? 'text-red-400' :
                'text-white/50'
              }`}>{log.action}</span>
              <span className="text-white/60 truncate">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
