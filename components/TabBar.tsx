"use client";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "ask", label: "Ask" },
  { id: "memory", label: "Memory" },
  { id: "timeline", label: "Timeline" },
  { id: "graph", label: "Graph" },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex items-center gap-8 border-b border-[#2c1a1e] w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative pb-4 text-sm font-medium transition-colors
              ${isActive ? "text-white" : "text-muted-foreground hover:text-white"}
            `}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(255,77,94,0.6)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
