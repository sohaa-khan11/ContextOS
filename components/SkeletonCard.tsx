"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="bg-[#180e10] border-[#2c1a1e] h-[240px] premium-shadow">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-16 bg-[#261619] rounded-md" />
          <Skeleton className="h-5 w-5 bg-[#261619] rounded-full" />
        </div>

        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4 bg-[#261619] rounded-md" />
          <Skeleton className="h-4 w-full bg-[#261619] rounded-md" />
          <Skeleton className="h-4 w-5/6 bg-[#261619] rounded-md" />
        </div>
        
        <div className="mt-auto">
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-4 w-20 bg-[#261619] rounded-md" />
            <Skeleton className="h-4 w-20 bg-[#261619] rounded-md" />
          </div>
          <Skeleton className="h-1.5 w-full bg-[#261619] rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
