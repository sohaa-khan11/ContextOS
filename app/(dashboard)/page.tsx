"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function OSDesktop() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

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

  return (
    <div className={`absolute top-12 left-12 z-10 transition-opacity duration-500 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/50">Neural Link Active</span>
      </div>
      <h1 className="text-5xl font-light tracking-tight text-white/90">
        Select a <span className="font-semibold text-white">Mind.</span>
      </h1>
    </div>
  );
}
