"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PerformanceMetric, useStore } from "../../../../lib/store";
import {
  useGetPerformanceByPath,
  PerformanceByPathItem,
} from "../../../../api/analytics/useGetPerformanceByPath";

// Performance metric thresholds for color coding
const getMetricColor = (metric: PerformanceMetric, value: number): string => {
  switch (metric) {
    case "lcp":
      if (value <= 2500) return "text-green-400";
      if (value <= 4000) return "text-yellow-400";
      return "text-red-400";
    case "cls":
      if (value <= 0.1) return "text-green-400";
      if (value <= 0.25) return "text-yellow-400";
      return "text-red-400";
    case "inp":
      if (value <= 200) return "text-green-400";
      if (value <= 500) return "text-yellow-400";
      return "text-red-400";
    case "fcp":
      if (value <= 1800) return "text-green-400";
      if (value <= 3000) return "text-yellow-400";
      return "text-red-400";
    case "ttfb":
      if (value <= 800) return "text-green-400";
      if (value <= 1800) return "text-yellow-400";
      return "text-red-400";
    default:
      return "text-white";
  }
};

const formatMetricValue = (
  metric: PerformanceMetric,
  value: number
): string => {
  if (metric === "cls") {
    return value.toFixed(3);
  }
  return Math.round(value).toString();
};

const getMetricUnit = (metric: PerformanceMetric): string => {
  if (metric === "cls") return "";
  return "ms";
};

const MetricCell = ({
  metric,
  value,
}: {
  metric: PerformanceMetric;
  value: number | null | undefined;
}) => {
  if (value === null || value === undefined) {
    return <span className="text-neutral-500">-</span>;
  }

  return (
    <span className={getMetricColor(metric, value)}>
      {formatMetricValue(metric, value)}
      <span className="text-xs ml-1 text-neutral-400">
        {getMetricUnit(metric)}
      </span>
    </span>
  );
};

export function PerformanceTable() {
  const { site } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: performanceData, isLoading } = useGetPerformanceByPath({
    site,
    page: currentPage,
    limit: pageSize,
  });

  const paths = performanceData?.data ?? [];
  const totalPages = Math.ceil((performanceData?.totalCount ?? 0) / pageSize);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Performance by Path
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-12 rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border border-neutral-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800">
                    <TableHead className="text-neutral-300">Path</TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      LCP
                    </TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      CLS
                    </TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      INP
                    </TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      FCP
                    </TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      TTFB
                    </TableHead>
                    <TableHead className="text-neutral-300 text-center">
                      Events
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paths.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-neutral-500 py-8"
                      >
                        No performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    paths.map((path: PerformanceByPathItem, index: number) => (
                      <TableRow
                        key={index}
                        className="border-neutral-800 hover:bg-neutral-900/50"
                      >
                        <TableCell className="font-medium text-white max-w-[300px] truncate">
                          {path.pathname || "/"}
                        </TableCell>
                        <TableCell className="text-center">
                          <MetricCell metric="lcp" value={path.lcp_avg} />
                        </TableCell>
                        <TableCell className="text-center">
                          <MetricCell metric="cls" value={path.cls_avg} />
                        </TableCell>
                        <TableCell className="text-center">
                          <MetricCell metric="inp" value={path.inp_avg} />
                        </TableCell>
                        <TableCell className="text-center">
                          <MetricCell metric="fcp" value={path.fcp_avg} />
                        </TableCell>
                        <TableCell className="text-center">
                          <MetricCell metric="ttfb" value={path.ttfb_avg} />
                        </TableCell>
                        <TableCell className="text-center text-neutral-300">
                          {path.event_count?.toLocaleString() ?? 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-neutral-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors",
                      currentPage === 1
                        ? "border-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors",
                      currentPage === totalPages
                        ? "border-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
