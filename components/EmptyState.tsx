"use client";
import { FolderGit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewProjectButton } from "./NewProjectButton";

export function EmptyState() {
  return (
    <Card className="bg-[#180e10] border-[#2c1a1e] w-full border-dashed premium-shadow">
      <CardContent className="h-[400px] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-[#261619] rounded-2xl flex items-center justify-center mb-6 border border-[#2c1a1e]">
          <FolderGit2 className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
          Initialize a new project session to begin tracking context, memory, and architectural decisions.
        </p>
        
        <NewProjectButton />
      </CardContent>
    </Card>
  );
}
