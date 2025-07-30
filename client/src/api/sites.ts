import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SiteImport = {
  importId: string;
  source: string;
  status: string;
  importedEvents: number | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  fileName: string;
};

interface ImportSiteDataParams {
  file: File;
  source: string;
  startDate?: string;
  endDate?: string;
}

async function getSiteImports(siteId: number): Promise<{ imports: SiteImport[] }> {
  const res = await fetch(`/api/sites/${siteId}/imports`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to fetch site imports' }));
    throw new Error(errorData.message || 'Failed to fetch site imports');
  }
  return res.json();
}

async function importSiteData(siteId: number, params: ImportSiteDataParams) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("source", params.source);

  // Add date range parameters if provided
  if (params.startDate) {
    formData.append("startDate", params.startDate);
  }
  if (params.endDate) {
    formData.append("endDate", params.endDate);
  }

  const res = await fetch(`/api/sites/${siteId}/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to import site data' }));
    throw new Error(errorData.message || errorData.error || 'Failed to import site data');
  }

  return res.json();
}

export function useGetSiteImports(siteId: number) {
  return useQuery({
    queryKey: ["siteImports", siteId],
    queryFn: () => getSiteImports(siteId),
    refetchInterval: (data) => {
      // Only refetch automatically if there are active imports
      const hasActiveImports = data.state.data?.imports?.some(imp =>
        imp.status === 'processing' || imp.status === 'pending'
      );
      return hasActiveImports ? 5000 : false; // 5 seconds if active, otherwise no auto-refetch
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a client error (400-499)
      if (error.message.includes('403') || error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

export function useImportSiteData(siteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ImportSiteDataParams) =>
      importSiteData(siteId, params),
    onSuccess: () => {
      // Invalidate and refetch imports list
      queryClient.invalidateQueries({
        queryKey: ["siteImports", siteId]
      });
    },
    onError: (error) => {
      console.error('Import failed:', error);
    },
    retry: false, // Don't retry file uploads automatically
  });
}
