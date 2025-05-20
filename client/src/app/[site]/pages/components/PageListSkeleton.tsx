"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PageListSkeletonProps = {
  count?: number;
};

export function PageListSkeleton({ count = 5 }: PageListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full mb-3">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
              {/* Left side: Page title/path skeleton */}
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Right side: Sparkline and count skeleton */}
              <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Sparkline chart placeholder */}
                <Skeleton className="h-16 w-48 rounded-md" />

                {/* Session count placeholder */}
                <div className="text-right min-w-[80px]">
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
