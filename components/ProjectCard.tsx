"use client";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Record<string, unknown> & {
    id: string | number;
    name: string;
    description: string;
    taskCount?: number;
    riskCount?: number;
    progress?: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  return (
    <Card 
      onClick={() => router.push(`/projects/${project.id}`)}
      className="bg-[#180e10] border-[#2c1a1e] hover:border-primary/50 cursor-pointer h-[240px] flex flex-col relative overflow-hidden group premium-shadow transition-all duration-300"
    >
      <CardContent className="p-6 flex flex-col h-full z-10">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="secondary" className="bg-[#261619] text-[#ffebec] hover:bg-[#261619] border border-[#2c1a1e]">
            ID: {project.id}
          </Badge>
          <ShieldCheck className="w-5 h-5 text-primary opacity-80" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors duration-200 mb-2">{project.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{project.taskCount || 0} Tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>{project.riskCount || 0} Risks</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Progress 
              value={project.progress || 0} 
              className="h-1.5 bg-[#261619]" 
              indicatorColor="bg-gradient-to-r from-primary to-purple-500" 
            />
            <span className="text-xs font-bold text-muted-foreground">{project.progress || 0}%</span>
          </div>
        </div>
      </CardContent>
      
      {/* Subtle hover glow inside the card */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors pointer-events-none" />
    </Card>
  );
}
