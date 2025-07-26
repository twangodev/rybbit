"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { MonitorEvent, useMonitorEvents } from "../../../../../api/uptime/monitors";
import { Pagination } from "../../../../../components/pagination";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { DateTime } from "luxon";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { cn } from "../../../../../lib/utils";

const columnHelper = createColumnHelper<MonitorEvent>();

// Component for timing waterfall visualization
function TimingWaterfall({ event }: { event: MonitorEvent }) {
  const timings = [
    { label: "DNS", time: event.dns_time_ms, color: "bg-purple-500" },
    { label: "TCP", time: event.tcp_time_ms, color: "bg-blue-500" },
    { label: "TLS", time: event.tls_time_ms, color: "bg-cyan-500" },
    { label: "TTFB", time: event.ttfb_ms, color: "bg-green-500" },
    { label: "Transfer", time: event.transfer_time_ms, color: "bg-yellow-500" },
  ].filter((t) => t.time && t.time > 0);

  const totalTime = event.response_time_ms || 0;

  if (timings.length === 0 || totalTime === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="text-sm font-medium mb-2">Timings</div>
      <div className="relative h-6 bg-neutral-800 rounded overflow-hidden">
        {(() => {
          let left = 0;
          return timings.map((timing) => {
            const width = (timing.time! / totalTime) * 100;
            const element = (
              <div
                key={timing.label}
                className={cn("absolute h-full", timing.color)}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                title={`${timing.label}: ${timing.time}ms`}
              />
            );
            left += width;
            return element;
          });
        })()}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {timings.map((timing) => (
          <div key={timing.label} className="flex items-center gap-1 text-xs">
            <div className={cn("w-3 h-3 rounded", timing.color)} />
            <span className="text-neutral-400">{timing.label}:</span>
            <span className="font-mono">{timing.time}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventsTable({ monitorId }: { monitorId: number }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: eventsData, isLoading: isLoadingEvents } = useMonitorEvents(monitorId, {
    limit: 100,
  });

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "status",
        header: () => <div className="w-8"></div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.status === "success" ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
        ),
        size: 40,
      }),
      columnHelper.accessor("timestamp", {
        header: "Time",
        cell: ({ row }) => {
          const timestamp = DateTime.fromSQL(row.original.timestamp, { zone: "utc" });
          return (
            <div className="text-sm">
              <div className="font-medium">{timestamp.toLocal().toRelative()}</div>
              <div className="text-xs text-neutral-500">{timestamp.toLocal().toFormat("MMM dd, HH:mm:ss")}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("status_code", {
        header: "Status",
        cell: ({ row }) => {
          const code = row.original.status_code;
          if (!code) return <span className="text-neutral-500">-</span>;

          if (code >= 500) {
            return <Badge variant="destructive">{code}</Badge>;
          }
          if (code >= 400) {
            return <Badge variant="warning">{code}</Badge>;
          }
          if (code >= 300) {
            return <Badge variant="info">{code}</Badge>;
          }
          if (code >= 200) {
            return <Badge variant="success">{code}</Badge>;
          }
          return <Badge variant="secondary">{code}</Badge>;
        },
      }),
      columnHelper.accessor("response_time_ms", {
        header: "Latency",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.response_time_ms ? `${Math.round(row.original.response_time_ms)}ms` : "-"}
          </span>
        ),
      }),
      columnHelper.accessor("region", {
        header: "Region",
        cell: ({ row }) => <span className="text-sm uppercase">{row.original.region || "-"}</span>,
      }),
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: eventsData?.events || [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-neutral-800">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize() === 150 ? undefined : header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoadingEvents ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-neutral-500 py-8">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow className="cursor-pointer hover:bg-neutral-900/50" onClick={() => toggleRow(row.id)}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>

                    {expandedRows.has(row.id) && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="bg-neutral-900 border-t border-neutral-800 p-6">
                            <div className="space-y-6">
                              {/* Timing Waterfall */}
                              {row.original.monitor_type === "http" && (
                                <div className="mb-6">
                                  <TimingWaterfall event={row.original} />
                                </div>
                              )}

                              {/* Error Message */}
                              {row.original.error_message && (
                                <div>
                                  <h4 className="text-sm font-medium text-red-500 mb-2">Error Message</h4>
                                  <div className="text-sm text-neutral-400 bg-neutral-900 p-3 rounded whitespace-pre-wrap font-mono">
                                    {row.original.error_message}
                                  </div>
                                </div>
                              )}

                              {/* Headers Table */}
                              {row.original.response_headers &&
                                Object.keys(row.original.response_headers).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Response Headers</h4>
                                    <div className="border border-neutral-800 rounded overflow-hidden">
                                      <table className="w-full text-sm">
                                        <tbody>
                                          {Object.entries(row.original.response_headers).map(([key, value], index) => (
                                            <tr
                                              key={key}
                                              className={cn(
                                                "border-b border-neutral-800",
                                                index === Object.keys(row.original.response_headers!).length - 1 &&
                                                  "border-b-0"
                                              )}
                                            >
                                              <td className="px-4 py-2 text-neutral-500 font-mono w-1/3 bg-neutral-900/50">
                                                {key}
                                              </td>
                                              <td className="px-4 py-2 text-neutral-300 font-mono break-all">
                                                {value}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                              {/* Additional Info */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-neutral-500">Status:</span>
                                  <span
                                    className={cn(
                                      "ml-2 font-medium",
                                      row.original.status === "success" ? "text-green-500" : "text-red-500"
                                    )}
                                  >
                                    {row.original.status}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-neutral-500">Status Code:</span>
                                  <span className="ml-2 font-mono">{row.original.status_code || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-500">Region:</span>
                                  <span className="ml-2">{row.original.region || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-500">Total Time:</span>
                                  <span className="ml-2 font-mono">{row.original.response_time_ms}ms</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoadingEvents && eventsData?.events?.length && eventsData?.events?.length > 0 && (
          <Pagination
            table={table}
            data={{
              items: table.getFilteredRowModel().rows.map((row) => row.original),
              total: table.getFilteredRowModel().rows.length,
            }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoadingEvents}
            itemName="events"
          />
        )}
      </CardContent>
    </Card>
  );
}
