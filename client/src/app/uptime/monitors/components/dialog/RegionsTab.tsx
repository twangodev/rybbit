import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Server, Info, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../../../../../api/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryFlag } from "@/app/[site]/components/shared/icons/CountryFlag";
import { IS_CLOUD } from "@/lib/const";
import { cn } from "@/lib/utils";

interface Region {
  code: string;
  name: string;
  isHealthy: boolean;
  lastHealthCheck: string | null;
  isLocal: boolean;
}

export function RegionsTab() {
  const form = useFormContext();
  const monitoringType = IS_CLOUD ? "global" : "local";
  const selectedRegions = form.watch("selectedRegions") || [];

  const { data: regionsData, isLoading } = useQuery({
    queryKey: ["uptime-regions"],
    queryFn: async () => {
      const response = await authedFetch<{ regions: Region[] }>("/uptime/regions");
      return response.regions;
    },
  });

  const regions = regionsData || [];
  const globalRegions = regions.filter((r: Region) => !r.isLocal);

  // Set monitoring type and preselect all regions on mount
  useEffect(() => {
    form.setValue("monitoringType", monitoringType);

    // Only set regions if they haven't been set yet and we're in cloud mode
    if (IS_CLOUD && globalRegions.length > 0 && !form.getValues("selectedRegions")?.length) {
      const allRegionCodes = globalRegions.map((r) => r.code);
      form.setValue("selectedRegions", allRegionCodes);
    }
  }, [monitoringType, form, globalRegions.length]); // Add proper dependencies

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  // Map region codes to country codes for flags
  const regionToCountry: Record<string, string> = {
    "us-east": "US",
    "us-west": "US",
    eu: "EU",
    asia: "SG",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {IS_CLOUD ? (
                <>
                  <Globe className="h-4 w-4" /> Global Monitoring
                </>
              ) : (
                <>
                  <Server className="h-4 w-4" /> Local Monitoring
                </>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {IS_CLOUD ? "Monitor from multiple regions worldwide" : "Monitor from your main server location only"}
            </p>
          </div>
        </div>
      </div>

      {IS_CLOUD ? (
        <>
          <FormField
            control={form.control}
            name="selectedRegions"
            render={() => (
              <FormItem>
                {/* <FormLabel>Select Regions</FormLabel>
                <FormDescription>
                  Choose which regions to monitor from. More regions provide better coverage.
                </FormDescription> */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {globalRegions.map((region: Region) => (
                    <FormField
                      key={region.code}
                      control={form.control}
                      name="selectedRegions"
                      render={({ field }) => {
                        const isSelected = field.value?.includes(region.code);
                        const isDisabled = !region.isHealthy;

                        return (
                          <FormItem>
                            <FormControl>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isDisabled) {
                                    const newValue = isSelected
                                      ? field.value?.filter((value: string) => value !== region.code)
                                      : [...(field.value || []), region.code];
                                    field.onChange(newValue);
                                  }
                                }}
                                disabled={isDisabled}
                                className={cn(
                                  "w-full flex items-center gap-3 rounded-lg border p-4 transition-all",
                                  "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2",
                                  isSelected &&
                                    !isDisabled &&
                                    "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500",
                                  !isSelected && !isDisabled && "border-neutral-700 hover:border-neutral-600",
                                  isDisabled && "border-neutral-800 opacity-50 cursor-not-allowed"
                                )}
                              >
                                {regionToCountry[region.code] && (
                                  <CountryFlag country={regionToCountry[region.code]} className="w-6 h-4" />
                                )}
                                <span
                                  className={cn("text-sm font-medium", isSelected && !isDisabled && "text-emerald-400")}
                                >
                                  {region.name}
                                </span>
                                {!region.isHealthy && <span className="ml-auto text-xs text-red-500">Offline</span>}
                              </button>
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRegions.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Please select at least one region for global monitoring.</AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Upgrade to Cloud or Enterprise tier to enable multi-region monitoring and get better uptime insights from
            multiple geographic locations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
