"use client";

import { Table } from "@tanstack/react-table";
import { AdminUser } from "@/types/admin";
import { TablePagination } from "@/components/pagination";

interface UserPaginationProps {
  table: Table<AdminUser>;
  data: { users: AdminUser[]; total: number } | undefined;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (value: { pageIndex: number; pageSize: number }) => void;
  isLoading: boolean;
}

export function UserTablePagination({
  table,
  data,
  pagination,
  setPagination,
  isLoading,
}: UserPaginationProps) {
  return (
    <TablePagination
      table={table}
      data={data ? { items: data.users, total: data.total } : undefined}
      pagination={pagination}
      setPagination={setPagination}
      isLoading={isLoading}
      itemName="users"
    />
  );
}
