import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";

export function ActionBar() {
  return (
    <div className="flex gap-3 mt-4 flex-wrap">
      <Button variant="outline" size="sm" className="rounded-lg h-9 bg-white dark:bg-[#111111] border-zinc-200/50 dark:border-white/10 shadow-sm hover:shadow text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all">
        <Copy className="w-3.5 h-3.5 mr-2 opacity-70" />
        Copy continuation prompt
      </Button>
      <Button variant="outline" size="sm" className="rounded-lg h-9 bg-white dark:bg-[#111111] border-zinc-200/50 dark:border-white/10 shadow-sm hover:shadow text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all">
        <RefreshCw className="w-3.5 h-3.5 mr-2 opacity-70" />
        Refresh memory
      </Button>
    </div>
  );
}
