import React from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Server, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../../../../../api/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Region {
  code: string;
  name: string;
  isHealthy: boolean;
  lastHealthCheck: string | null;
  isLocal: boolean;
}

export function RegionsTab() {
  const form = useFormContext();
  const monitoringType = form.watch("monitoringType") || "local";
  const selectedRegions = form.watch("selectedRegions") || ["local"];

  const { data: regionsData, isLoading } = useQuery({
    queryKey: ["uptime-regions"],
    queryFn: async () => {
      const response = await authedFetch<{ regions: Region[] }>("/uptime/regions");
      return response.regions;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const regions = regionsData || [];
  const globalRegions = regions.filter((r: Region) => !r.isLocal);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="monitoringType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monitoring Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "local"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="local">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4" />
                    <span>Local Monitoring</span>
                  </div>
                </SelectItem>
                <SelectItem value="global">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Global Monitoring</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {field.value === "local" 
                ? "Monitor from your main server location only" 
                : "Monitor from multiple regions worldwide"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {monitoringType === "global" && (
        <>
          <FormField
            control={form.control}
            name="selectedRegions"
            render={() => (
              <FormItem>
                <FormLabel>Select Regions</FormLabel>
                <FormDescription>
                  Choose which regions to monitor from. More regions provide better coverage but may increase costs.
                </FormDescription>
                <div className="space-y-3 mt-3">
                  {globalRegions.map((region: Region) => (
                    <FormField
                      key={region.code}
                      control={form.control}
                      name="selectedRegions"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-normal">
                                {region.name}
                              </FormLabel>
                              {!region.isHealthy && (
                                <FormDescription className="text-xs text-red-500">
                                  Currently unhealthy
                                </FormDescription>
                              )}
                              {region.lastHealthCheck && (
                                <FormDescription className="text-xs">
                                  Last checked: {new Date(region.lastHealthCheck).toLocaleString()}
                                </FormDescription>
                              )}
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value?.includes(region.code)}
                                onCheckedChange={(checked: boolean) => {
                                  return checked
                                    ? field.onChange([...field.value, region.code])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) => value !== region.code
                                        )
                                      );
                                }}
                                disabled={!region.isHealthy}
                              />
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
              <AlertDescription>
                Please select at least one region for global monitoring.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}