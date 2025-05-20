"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { useGetPageTitlesPaginated } from "@/api/analytics/useGetPageTitles";
import { useSetPageTitle } from "@/hooks/useSetPageTitle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageListItem } from "./components/PageListItem";
import { PageListSkeleton } from "./components/PageListSkeleton";
import { Pagination } from "./components/Pagination";
import { PageTitleItem } from "@/api/analytics/useGetPageTitles";

// Number of items per page
const PAGE_SIZE = 10;

export default function Pages() {
  // Global state
  const { site } = useStore();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Set the page title
  useSetPageTitle("Rybbit · Pages");

  if (!site) {
    return null;
  }

  // Calculate offset based on current page
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch pages data using the paginated hook
  const {
    data: apiResponse,
    isLoading: isLoadingPages,
    isError: isErrorPages,
    error: pagesError,
    isPlaceholderData,
    isFetching,
  } = useGetPageTitlesPaginated({
    limit: PAGE_SIZE,
    offset: offset,
  });

  // Data is now apiResponse.data.data and totalCount is apiResponse.data.totalCount
  const pagesDataArray: PageTitleItem[] | undefined = apiResponse?.data?.data;
  const totalCount: number | undefined = apiResponse?.data?.totalCount;

  // Determine if we should show the loading state - show skeleton for ANY loading or fetching
  const isLoading = isLoadingPages || isFetching;

  useEffect(() => {
    if (!isLoadingPages && !isPlaceholderData && !isFetching) {
      if (totalCount !== undefined) {
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
      } else if (
        pagesDataArray &&
        pagesDataArray.length === 0 &&
        offset === 0
      ) {
        // Fallback if totalCount is somehow undefined but we have an empty array on page 1
        setTotalPages(0);
      } else if (pagesDataArray && pagesDataArray.length < PAGE_SIZE) {
        // Fallback: if less than a full page is returned, assume it's the last
        setTotalPages(currentPage);
      }
      // If totalCount is undefined and we have a full page, we can't be sure of totalPages
      // In this scenario, the UI might show a next button that leads to an empty page if it was the last one.
      // This is a limitation if totalCount is not reliably provided.
    } else if (currentPage === 1 && isLoadingPages && !pagesDataArray) {
      // Initial load, no data yet
      setTotalPages(0);
    }
  }, [
    apiResponse,
    totalCount,
    pagesDataArray,
    isLoadingPages,
    isPlaceholderData,
    isFetching,
    currentPage,
    offset,
  ]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1) return;
    // With totalCount, we can be more direct.
    // Allow navigating to any page up to totalPages if totalPages is known and > 0.
    // If totalPages is 0 (e.g. initial load or no data), only allow navigating to page 1.
    if (totalPages > 0 && page > totalPages) return;
    if (totalPages === 0 && page > 1) return;

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3">
      <SubHeader />

      {/* <CardTitle>All Pages</CardTitle>
      <CardDescription>
        Overview of your website's pages, sorted by session count
      </CardDescription> */}
      {
        isLoading ? (
          <PageListSkeleton count={PAGE_SIZE} />
        ) : isErrorPages ? (
          <div className="text-center p-8 text-destructive">
            <p>Error loading pages data</p>
            <p className="text-sm">{pagesError?.toString()}</p>
          </div>
        ) : pagesDataArray && pagesDataArray.length > 0 ? (
          <>
            {pagesDataArray.map((pageItem: PageTitleItem, index: number) => (
              <PageListItem
                key={`${pageItem.value}-${index}-${currentPage}`}
                pageData={{
                  value: pageItem.pathname,
                  title: pageItem.value,
                  count: pageItem.count,
                  percentage: pageItem.percentage,
                }}
              />
            ))}
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : !isLoadingPages && !isFetching ? ( // Only show "No pages" if not loading
          <div className="text-center py-12 text-muted-foreground">
            <p>No pages data found for the selected period.</p>
          </div>
        ) : null // Otherwise, render nothing (or a minimal loader if preferred while subsequent pages load)
      }
    </div>
  );
}
