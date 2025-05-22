"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminUsers, AdminUserData } from "@/api/admin/getAdminUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, ChevronDown, ChevronRight, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/pagination";
import { authClient } from "@/lib/auth";
import { userStore } from "@/lib/userStore";

export function OrgUsersList() {
  const router = useRouter();
  const { data: users, isLoading, isError } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const toggleExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Filter users based on search query
  const filteredUsers = users?.filter((user) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(lowerSearchQuery) ||
      user.email.toLowerCase().includes(lowerSearchQuery) ||
      user.sites.some((site) =>
        site.domain.toLowerCase().includes(lowerSearchQuery)
      )
    );
  });

  // Paginate the filtered users
  const paginatedUsers = filteredUsers?.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  // Pagination controller for TablePagination
  const paginationController = {
    getState: () => ({ pagination }),
    getCanPreviousPage: () => pagination.pageIndex > 0,
    getCanNextPage: () =>
      filteredUsers
        ? pagination.pageIndex <
          Math.ceil(filteredUsers.length / pagination.pageSize) - 1
        : false,
    getPageCount: () =>
      filteredUsers ? Math.ceil(filteredUsers.length / pagination.pageSize) : 0,
    setPageIndex: (index: number) =>
      setPagination({ ...pagination, pageIndex: index }),
    previousPage: () =>
      setPagination({
        ...pagination,
        pageIndex: Math.max(0, pagination.pageIndex - 1),
      }),
    nextPage: () =>
      setPagination({
        ...pagination,
        pageIndex: Math.min(
          filteredUsers
            ? Math.ceil(filteredUsers.length / pagination.pageSize) - 1
            : 0,
          pagination.pageIndex + 1
        ),
      }),
  };

  // Impersonation handler
  const handleImpersonate = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({
        userId,
      });
      router.push("/");
      window.location.reload();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error(`Failed to impersonate user: ${errorMessage}`);
      return false;
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load organization users data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Organization Owners</h2>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, email or domain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border border-neutral-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Monthly Events</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(pagination.pageSize)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-5" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
            ) : paginatedUsers && paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <>
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={() => toggleExpand(user.id)}
                      >
                        {expandedUsers.has(user.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name || "Unnamed"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {user.monthlyEventCount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Badge>{user.sites.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleImpersonate(user.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        disabled={user.id === userStore.getState().user?.id}
                      >
                        <User className="h-4 w-4" />
                        Impersonate
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedUsers.has(user.id) && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="bg-neutral-900 py-2 px-8"
                      >
                        <div className="text-sm font-semibold mb-2">Sites:</div>
                        {user.sites.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {user.sites.map((site) => (
                              <div
                                key={site.siteId}
                                className="p-3 border border-neutral-700 rounded"
                              >
                                <div className="font-medium">
                                  <Link
                                    href={`/${site.siteId}`}
                                    target="_blank"
                                    className="hover:underline"
                                  >
                                    {site.name || site.domain}
                                  </Link>
                                </div>
                                <div className="text-sm text-neutral-400 mt-1">
                                  <Link
                                    href={`https://${site.domain}`}
                                    target="_blank"
                                    className="hover:underline"
                                  >
                                    {site.domain}
                                  </Link>
                                </div>
                                <div className="text-xs text-neutral-500 mt-1">
                                  Created:{" "}
                                  {formatDistanceToNow(
                                    new Date(site.createdAt),
                                    { addSuffix: true }
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-neutral-400">No sites</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  {searchQuery
                    ? "No users match your search"
                    : "No organization owners found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <TablePagination
          table={paginationController}
          data={
            filteredUsers
              ? { items: filteredUsers, total: filteredUsers.length }
              : undefined
          }
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          itemName="users"
        />
      </div>
    </div>
  );
}
