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
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { PerformanceMetric, useStore } from "../../../../lib/store";
import {
  useGetPerformanceByPath,
  PerformanceByPathItem,
} from "../../../../api/analytics/useGetPerformanceByPath";
import { TablePagination } from "../../../../components/pagination";

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

const columnHelper = createColumnHelper<PerformanceByPathItem>();

export function PerformanceTable() {
  const { site, selectedPercentile } = useStore();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "event_count", desc: true },
  ]);

  const { data: performanceData, isLoading } = useGetPerformanceByPath({
    site,
    page: pagination.pageIndex + 1, // API expects 1-based page numbers
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id || "event_count",
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  const paths = performanceData?.data ?? [];
  const totalCount = performanceData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  // Create columns based on selected percentile
  const columns = useMemo(
    () => [
      columnHelper.accessor("pathname", {
        header: "Path",
        cell: (info) => (
          <div className="font-medium text-white max-w-[300px] truncate">
            {info.getValue() || "/"}
          </div>
        ),
      }),
      columnHelper.accessor(
        `lcp_${selectedPercentile}` as keyof PerformanceByPathItem,
        {
          header: "LCP",
          cell: (info) => (
            <div className="text-center">
              <MetricCell metric="lcp" value={info.getValue() as number} />
            </div>
          ),
        }
      ),
      columnHelper.accessor(
        `cls_${selectedPercentile}` as keyof PerformanceByPathItem,
        {
          header: "CLS",
          cell: (info) => (
            <div className="text-center">
              <MetricCell metric="cls" value={info.getValue() as number} />
            </div>
          ),
        }
      ),
      columnHelper.accessor(
        `inp_${selectedPercentile}` as keyof PerformanceByPathItem,
        {
          header: "INP",
          cell: (info) => (
            <div className="text-center">
              <MetricCell metric="inp" value={info.getValue() as number} />
            </div>
          ),
        }
      ),
      columnHelper.accessor(
        `fcp_${selectedPercentile}` as keyof PerformanceByPathItem,
        {
          header: "FCP",
          cell: (info) => (
            <div className="text-center">
              <MetricCell metric="fcp" value={info.getValue() as number} />
            </div>
          ),
        }
      ),
      columnHelper.accessor(
        `ttfb_${selectedPercentile}` as keyof PerformanceByPathItem,
        {
          header: "TTFB",
          cell: (info) => (
            <div className="text-center">
              <MetricCell metric="ttfb" value={info.getValue() as number} />
            </div>
          ),
        }
      ),
      columnHelper.accessor("event_count", {
        header: "Events",
        cell: (info) => (
          <div className="text-center text-neutral-300">
            {info.getValue()?.toLocaleString() ?? 0}
          </div>
        ),
      }),
    ],
    [selectedPercentile]
  );

  const table = useReactTable({
    data: paths,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater);
      // Reset to first page when sorting changes
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    state: {
      sorting,
    },
    // Disable client-side sorting since we're doing server-side sorting
    enableSortingRemoval: false,
    manualSorting: true,
  });

  // Create pagination controller that matches the interface
  const paginationController = {
    getState: () => ({ pagination }),
    getCanPreviousPage: () => pagination.pageIndex > 0,
    getCanNextPage: () => pagination.pageIndex < totalPages - 1,
    getPageCount: () => totalPages,
    setPageIndex: (index: number) =>
      setPagination((prev) => ({ ...prev, pageIndex: index })),
    previousPage: () =>
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, prev.pageIndex - 1),
      })),
    nextPage: () =>
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
      })),
  };

  // Transform data to match expected format
  const paginationData = {
    items: paths,
    total: totalCount,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Performance by Path ({selectedPercentile.toUpperCase()})
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
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-neutral-800"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`text-neutral-300 ${
                            header.column.getCanSort()
                              ? "cursor-pointer hover:text-white transition-colors select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-3 w-3 text-blue-400" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-3 w-3 text-blue-400" />
                                ) : (
                                  <ChevronsUpDown className="h-3 w-3 text-neutral-600" />
                                )}
                              </div>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center text-neutral-500 py-8"
                      >
                        No performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-neutral-800 hover:bg-neutral-900/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <TablePagination
                  table={paginationController}
                  data={paginationData}
                  pagination={pagination}
                  setPagination={setPagination}
                  isLoading={isLoading}
                  itemName="paths"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
