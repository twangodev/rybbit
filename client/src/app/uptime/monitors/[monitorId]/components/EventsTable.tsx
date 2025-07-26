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
import { useMemo, useState } from "react";
import { MonitorEvent, useMonitorEvents } from "../../../../../api/uptime/monitors";
import { Pagination } from "../../../../../components/pagination";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { DateTime } from "luxon";
import { Badge } from "../../../../../components/ui/badge";

const columnHelper = createColumnHelper<MonitorEvent>();

export function EventsTable({ monitorId }: { monitorId: number }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data: eventsData, isLoading: isLoadingEvents } = useMonitorEvents(monitorId, {
    limit: 100,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            {row.original.status === "success" ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            {DateTime.fromSQL(row.original.timestamp, { zone: "utc" }).toRelative()}
          </span>
        ),
      }),
      columnHelper.accessor("status_code", {
        header: "Status Code",
        cell: ({ row }) => {
          if (row.original.status_code && row.original.status_code >= 500) {
            return <Badge variant="destructive">{row.original.status_code}</Badge>;
          }
          if (row.original.status_code && row.original.status_code >= 400) {
            return <Badge variant="warning">{row.original.status_code}</Badge>;
          }
          if (row.original.status_code && row.original.status_code >= 300) {
            return <Badge variant="secondary">{row.original.status_code}</Badge>;
          }
          if (row.original.status_code && row.original.status_code >= 200) {
            return <Badge variant="green">{row.original.status_code}</Badge>;
          }
          return row.original.status_code;
        },
      }),
      columnHelper.accessor("response_time_ms", {
        header: "Response Time (ms)",
        cell: ({ row }) => row.original.response_time_ms,
      }),
      columnHelper.accessor("region", {
        header: "Region",
        cell: ({ row }) => row.original.region,
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

  if (isLoadingEvents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
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
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-neutral-900/50"
                  //   onClick={() => onMonitorClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
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
    </div>
  );
}
