"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FolderGit2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreationModal({ open, onOpenChange }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#180e10] border-[#2c1a1e] premium-shadow rounded-2xl">
        <DialogHeader className="mb-4">
          <div className="w-12 h-12 bg-[#261619] rounded-xl flex items-center justify-center border border-[#2c1a1e] mb-4">
            <FolderGit2 className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">Create New Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Start building your memory by linking a local repository.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); onOpenChange(false); }} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f3e8e8]">Project name</label>
            <Input 
              required
              type="text" 
              placeholder="e.g. AI Agent Platform" 
              className="bg-[#11090a] border-[#2c1a1e] h-10 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f3e8e8]">Description (optional)</label>
            <Input 
              type="text" 
              placeholder="What's this project about?" 
              className="bg-[#11090a] border-[#2c1a1e] h-20 focus-visible:ring-primary/40 text-sm align-text-top"
            />
          </div>
          
          <div className="bg-[#261619] border border-[#2c1a1e] rounded-xl p-3 flex gap-3 mt-4">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensure you have granted ContextOS filesystem permissions for this directory before initializing.
            </p>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white hover:bg-[#261619]">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_15px_rgba(255,77,94,0.3)]">
              Create project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
