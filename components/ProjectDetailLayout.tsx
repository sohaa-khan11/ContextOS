"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Box } from "lucide-react";
import { TabBar } from "./TabBar";
import { OverviewTab } from "./OverviewTab";
import { AskTab } from "./AskTab";
import { TimelineTab } from "./TimelineTab";
import { GraphTab } from "./GraphTab";
import { MemoryViewerTab } from "./MemoryViewerTab";

export function ProjectDetailLayout({ projectName }: { projectName: string }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header section matching reference */}
      <div className="mb-8">
        <p className="text-xs text-primary font-bold tracking-wide uppercase mb-2">Project Detail</p>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {projectName}
          </h2>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-[#2c1a1e] bg-[#180e10] hover:bg-[#261619] hover:text-white text-muted-foreground rounded-full h-10 px-5 transition-colors">
              <Copy className="w-4 h-4 mr-2" />
              Copy prompt
            </Button>
            <Button variant="outline" className="border-[#2c1a1e] bg-[#180e10] hover:bg-[#261619] hover:text-white text-muted-foreground rounded-full h-10 px-5 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh memory
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 px-6 shadow-[0_0_15px_rgba(255,77,94,0.3)] transition-all">
              <Box className="w-4 h-4 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "ask" && <AskTab />}
        {activeTab === "memory" && <MemoryViewerTab />}
        {activeTab === "timeline" && <TimelineTab />}
        {activeTab === "graph" && <GraphTab />}
      </div>
    </div>
  );
}
