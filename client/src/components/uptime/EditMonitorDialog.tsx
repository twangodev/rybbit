import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMonitor, UptimeMonitor } from "@/api/uptime/monitors";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateMonitorSchema, UpdateMonitorFormData } from "./monitorSchemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface EditMonitorDialogProps {
  monitor: UptimeMonitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INTERVAL_OPTIONS = [
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 7200, label: "2 hours" },
  { value: 21600, label: "6 hours" },
  { value: 86400, label: "24 hours" },
];

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"] as const;

export function EditMonitorDialog({ monitor, open, onOpenChange }: EditMonitorDialogProps) {
  const updateMonitor = useUpdateMonitor();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(updateMonitorSchema),
    defaultValues: {
      name: monitor.name,
      intervalSeconds: monitor.intervalSeconds,
      enabled: monitor.enabled,
      httpConfig: monitor.httpConfig ? {
        ...monitor.httpConfig,
        method: monitor.httpConfig.method as any
      } : undefined,
      tcpConfig: monitor.tcpConfig,
      validationRules: monitor.validationRules,
      regions: monitor.regions,
    },
  });

  // Reset form when monitor changes or dialog opens
  useEffect(() => {
    if (open && monitor) {
      form.reset({
        name: monitor.name,
        intervalSeconds: monitor.intervalSeconds,
        enabled: monitor.enabled,
        httpConfig: monitor.httpConfig ? {
          ...monitor.httpConfig,
          method: monitor.httpConfig.method as any
        } : undefined,
        tcpConfig: monitor.tcpConfig,
        validationRules: monitor.validationRules,
        regions: monitor.regions,
      });
    }
  }, [monitor, open, form]);

  const onSubmit = async (data: any) => {
    try {
      await updateMonitor.mutateAsync({ 
        monitorId: monitor.id, 
        data 
      });
      toast.success("Monitor updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update monitor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Monitor</DialogTitle>
              <DialogDescription>
                Update the configuration for this monitor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Monitor Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My API Endpoint" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monitor Type (Read-only) */}
              <div className="space-y-2">
                <FormLabel>Monitor Type</FormLabel>
                <div className="px-3 py-2 border rounded-md bg-neutral-900 text-neutral-400">
                  {monitor.monitorType === "http" ? "HTTP/HTTPS" : "TCP Port"}
                </div>
              </div>

              {/* HTTP Configuration */}
              {monitor.monitorType === "http" && form.watch("httpConfig") && (
                <>
                  <FormField
                    control={form.control}
                    name="httpConfig.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://api.example.com/health" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="httpConfig.method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTTP Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HTTP_METHODS.map(method => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="httpConfig.timeoutMs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (ms)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ""}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* TCP Configuration */}
              {monitor.monitorType === "tcp" && form.watch("tcpConfig") && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tcpConfig.host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input placeholder="example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tcpConfig.port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ""}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Check Interval */}
              <FormField
                control={form.control}
                name="intervalSeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Interval</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTERVAL_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enabled Switch */}
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Monitor</FormLabel>
                      <FormDescription>
                        Monitor will run at the configured interval when enabled
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Advanced Options */}
              {monitor.monitorType === "http" && form.watch("httpConfig") && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced Options
                  </Button>

                  {showAdvanced && (
                    <div className="space-y-4 pl-4 border-l-2 border-neutral-700">
                      <FormField
                        control={form.control}
                        name="httpConfig.userAgent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Agent</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Custom User Agent" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Override the default user agent string
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="httpConfig.headers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Headers (JSON)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='{\n  "X-API-Key": "your-key"\n}'
                                rows={4}
                                value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                                onChange={(e) => {
                                  try {
                                    const headers = e.target.value ? JSON.parse(e.target.value) : undefined;
                                    field.onChange(headers);
                                  } catch (err) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Additional headers to send with requests
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="httpConfig.followRedirects"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Follow Redirects</FormLabel>
                              <FormDescription>
                                Automatically follow HTTP redirects
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="httpConfig.ipVersion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IP Version</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value="ipv4">IPv4 Only</SelectItem>
                                <SelectItem value="ipv6">IPv6 Only</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMonitor.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMonitor.isPending}>
                {updateMonitor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Monitor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}