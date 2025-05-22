"use client";

import { Table } from "@tanstack/react-table";
import { AdminSiteData } from "@/api/admin/getAdminSites";
import { TablePagination } from "@/components/pagination";

interface SitePaginationProps {
  table: Table<AdminSiteData>;
  data: AdminSiteData[] | undefined;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (value: { pageIndex: number; pageSize: number }) => void;
  isLoading: boolean;
}

export function SiteTablePagination({
  table,
  data,
  pagination,
  setPagination,
  isLoading,
}: SitePaginationProps) {
  return (
    <TablePagination
      table={table}
      data={data ? { items: data, total: data.length } : undefined}
      pagination={pagination}
      setPagination={setPagination}
      isLoading={isLoading}
      itemName="sites"
    />
  );
}
