"use client";
import { Database, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function MemoryViewerTab() {
  const memories = [
    { key: "User authentication flow", type: "Note", color: "bg-yellow-500", time: "2m ago" },
    { key: "Chose Next.js for frontend", type: "Decision", color: "bg-blue-500", time: "12m ago" },
    { key: "Implement memory search", type: "Task", color: "bg-red-500", time: "1h ago" },
    { key: "Cognee integration notes", type: "Note", color: "bg-yellow-500", time: "2h ago" },
  ];

  return (
    <Card className="flex flex-col h-full bg-[#180e10] border-[#2c1a1e] premium-shadow">
      <div className="p-6 border-b border-[#2c1a1e] flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Memory</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Search memories..." 
              className="bg-[#11090a] border-[#2c1a1e] h-10 pl-11 text-sm focus-visible:ring-primary/40"
            />
          </div>
          <Button variant="outline" className="h-10 w-10 p-0 border-[#2c1a1e] bg-[#11090a] text-muted-foreground hover:bg-[#261619] hover:text-white shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {memories.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-[#261619] transition-colors cursor-pointer group border border-transparent hover:border-[#2c1a1e]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#261619] flex items-center justify-center border border-[#2c1a1e]">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{m.key}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${m.color}`} />
                  <span className="text-xs text-muted-foreground font-medium">{m.type}</span>
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{m.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
