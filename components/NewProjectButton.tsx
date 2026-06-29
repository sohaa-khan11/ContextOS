"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ProjectCreationModal } from "./ProjectCreationModal";
import { Button } from "@/components/ui/button";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_15px_rgba(255,77,94,0.3)] hover:shadow-[0_0_25px_rgba(255,77,94,0.5)] transition-all duration-300"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Project
      </Button>
      <ProjectCreationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
