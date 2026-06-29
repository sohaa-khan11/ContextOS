"use client";
import { GitGraph } from "lucide-react";
import { Card } from "@/components/ui/card";

export function GraphTab() {
  return (
    <Card className="flex flex-col h-[700px] max-h-[80vh] bg-[#180e10] border-[#2c1a1e] premium-shadow p-0 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          {/* Central node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,77,94,0.3)] z-10">
            <span className="font-bold text-white text-sm">ContextOS</span>
          </div>

          {/* Orbiting nodes */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-[#261619] border border-[#2c1a1e] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#f3e8e8] text-xs font-medium">Auth</span>
          </div>
          <div className="absolute bottom-20 right-10 w-20 h-20 bg-[#261619] border border-[#2c1a1e] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#f3e8e8] text-xs font-medium">Memory</span>
          </div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-[#261619] border border-[#2c1a1e] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#f3e8e8] text-xs font-medium">DB</span>
          </div>
          
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 stroke-primary" strokeWidth="1">
            <line x1="200" y1="200" x2="72" y2="72" />
            <line x1="200" y1="200" x2="330" y2="330" />
            <line x1="200" y1="200" x2="124" y2="336" />
          </svg>
        </div>
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#11090a]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[#2c1a1e] shadow-lg">
        <GitGraph className="w-4 h-4 text-primary" />
        <span className="font-bold text-white text-xs tracking-wide">KNOWLEDGE GRAPH</span>
      </div>
    </Card>
  );
}
