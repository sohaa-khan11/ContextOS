"use client";
import { ProjectCard } from "./ProjectCard";
import { SkeletonCard } from "./SkeletonCard";

interface ProjectGridProps {
  projects: (Record<string, unknown> & {
    id: string | number;
    name: string;
    description: string;
    taskCount?: number;
    riskCount?: number;
    progress?: number;
  })[];
  isLoading: boolean;
}

export function ProjectGrid({ projects, isLoading }: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
