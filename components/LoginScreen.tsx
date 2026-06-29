"use client";
import { EnterDemoButton } from "./EnterDemoButton";
import { Command } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <Card className="max-w-md w-full bg-[#180e10]/80 backdrop-blur-xl border-[#2c1a1e] p-10 text-center relative z-10 premium-shadow">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,77,94,0.4)] mx-auto mb-6">
          <Command className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">ContextOS</h1>
        <p className="text-muted-foreground text-sm mb-10">
          The AI-Native Memory OS for modern projects.
        </p>
        <EnterDemoButton />
      </Card>
    </div>
  );
}
