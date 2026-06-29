"use client";
import { CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Decisions Card */}
      <Card className="bg-[#180e10] border-[#2c1a1e] premium-shadow h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#261619] flex items-center justify-center">📋</span>
            Decisions
          </CardTitle>
          <Badge variant="secondary" className="bg-[#261619] hover:bg-[#261619] text-[#ffebec]">2</Badge>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-[#2c1a1e] bg-[#11090a]" />
            <span className="text-sm text-muted-foreground">Chose Next.js for frontend</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-[#2c1a1e] bg-[#11090a]" />
            <span className="text-sm text-muted-foreground">Using Cognee for memory layer</span>
          </div>
          <button className="text-xs font-medium text-primary mt-4 hover:underline transition-all">
            +2 more decisions
          </button>
        </CardContent>
      </Card>

      {/* Tasks Card */}
      <Card className="bg-[#180e10] border-[#2c1a1e] premium-shadow h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#261619] flex items-center justify-center text-primary">✓</span>
            Tasks
          </CardTitle>
          <Badge variant="secondary" className="bg-[#261619] hover:bg-[#261619] text-[#ffebec]">12</Badge>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-white font-medium">Build extension popup</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-white font-medium">Implement memory search</span>
          </div>
          <button className="text-xs font-medium text-primary mt-4 hover:underline transition-all">
            +10 more tasks
          </button>
        </CardContent>
      </Card>

      {/* Goals Card */}
      <Card className="bg-[#180e10] border-[#2c1a1e] premium-shadow h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#261619] flex items-center justify-center text-primary">🎯</span>
            Goals
          </CardTitle>
          <Badge variant="secondary" className="bg-[#261619] hover:bg-[#261619] text-[#ffebec]">1</Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-white leading-relaxed font-medium">
            Build a memory OS that never lets you lose context across any tool.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Progress value={60} className="h-1.5 bg-[#261619] flex-1" indicatorColor="bg-gradient-to-r from-primary to-purple-500" />
            <span className="text-xs font-bold text-muted-foreground">60%</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Risks Card */}
      <Card className="bg-[#180e10] border-[#2c1a1e] premium-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Risks
          </CardTitle>
          <Badge variant="secondary" className="bg-[#261619] hover:bg-[#261619] text-[#ffebec]">1</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Cognee integration complexity</p>
          <p className="text-sm text-muted-foreground">Time constraint</p>
          <button className="text-xs font-medium text-primary mt-2 hover:underline transition-all">
            +1 more risk
          </button>
        </CardContent>
      </Card>

      {/* Capture Input Card (Spans 2 columns) */}
      <Card className="bg-[#180e10] border-[#2c1a1e] premium-shadow lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#261619] flex items-center justify-center text-primary">✨</span>
            Capture new memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">What happened, what did you learn, what matters?</p>
          <div className="flex gap-4">
            <Input 
              placeholder="e.g. Added shadcn components for UI consistency" 
              className="bg-[#11090a] border-[#2c1a1e] h-12 focus-visible:ring-primary/40 text-sm"
            />
            <Button className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
