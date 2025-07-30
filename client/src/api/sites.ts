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

async function getSiteImports(siteId: number): Promise<{ imports: SiteImport[] }> {
  const res = await fetch(`/api/sites/${siteId}/imports`);
  if (!res.ok) {
    throw new Error("Failed to fetch site imports");
  }
  return res.json();
}

async function importSiteData(siteId: number, file: File, source: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);

  const res = await fetch(`/api/sites/${siteId}/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to import site data");
  }

  return res.json();
}

export function useGetSiteImports(siteId: number) {
    return useQuery({
        queryKey: ["siteImports", siteId],
        queryFn: () => getSiteImports(siteId),
        refetchInterval: 5000, // Refetch every 5 seconds
    });
}

export function useImportSiteData(siteId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newImport: { file: File; source: string }) =>
            importSiteData(siteId, newImport.file, newImport.source),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["siteImports", siteId] });
        },
    });
}
