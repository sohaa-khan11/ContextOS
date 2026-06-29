import { Box } from "lucide-react";

export function ProjectHeader({ name }: { name: string }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200/50 dark:border-white/10 shadow-sm flex items-center justify-center shrink-0">
        <Box className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
      </div>
      <div className="pt-0.5">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{name}</h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Active memory instance
        </p>
      </div>
    </div>
  );
}
