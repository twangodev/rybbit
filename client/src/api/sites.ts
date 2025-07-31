import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/api/utils";
import { useStore } from "@/lib/store";
import { APIResponse } from "@/api/types";

interface SiteImport {
  importId: string;
  source: "umami";
  status: "pending" | "processing" | "completed" | "failed";
  importedEvents: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  fileName: string;
}

interface ImportSiteDataParams {
  file: File;
  source: string;
  startDate?: string;
  endDate?: string;
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
    const errorData = await res.json().catch(() => ({ message: "Failed to import site data" }));
    throw new Error(errorData.message || errorData.error || "Failed to import site data");
  }

  return res.json();
}

export function useGetSiteImports() {
  const { site } = useStore();

  return useQuery({
    queryKey: ["get-site-imports", site],
    queryFn: async () => await authedFetch<APIResponse<SiteImport[]>>(`/get-site-imports/${site}`),
    refetchInterval: (data) => {
      const hasActiveImports = data.state.data?.data.some(imp =>
        imp.status === "processing" || imp.status === "pending"
      );
      return hasActiveImports ? 5000 : false;
    },
    staleTime: 30000,
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
      console.error("Import failed:", error);
    },
    retry: false, // Don"t retry file uploads automatically
  });
}
