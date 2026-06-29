"use client";

import { useState, useEffect } from "react";
import { ProjectGrid } from "@/components/ProjectGrid";

export default function DashboardPage() {
  const [projects, setProjects] = useState<
    (Record<string, unknown> & { id: string | number; name: string; description: string; taskCount?: number; riskCount?: number; progress?: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch actual projects
    // For now we mock the populated state for UI demonstration
    setTimeout(() => {
      setProjects([
        { id: "1", name: "ContextOS hackathon build", taskCount: 4, riskCount: 1 },
        { id: "2", name: "Client migration", taskCount: 12, riskCount: 3 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div>
      <ProjectGrid projects={projects} isLoading={isLoading} />
    </div>
  );
}
