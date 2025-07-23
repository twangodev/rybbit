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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMonitor } from "@/api/uptime/monitors";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createMonitorSchema, CreateMonitorFormData } from "./monitorSchemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "../../lib/auth";

interface CreateMonitorDialogProps {
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

export function CreateMonitorDialog({ open, onOpenChange }: CreateMonitorDialogProps) {
  const { data: activeOrganization, isPending } = authClient.useActiveOrganization();
  const createMonitor = useCreateMonitor();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: {
      organizationId: activeOrganization?.id || "",
      name: "",
      monitorType: "http" as const,
      intervalSeconds: 300,
      enabled: true,
      httpConfig: {
        url: "",
        method: "GET" as const,
        followRedirects: true,
        timeoutMs: 30000,
        ipVersion: "any" as const,
      },
      validationRules: [],
      regions: ["local"],
    },
  });

  const monitorType = form.watch("monitorType");

  const onSubmit = async (data: any) => {
    try {
      await createMonitor.mutateAsync(data);
      toast.success("Monitor created successfully");
      onOpenChange(false);
      form.reset();
      setShowAdvanced(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create monitor");
    }
  };

  // Set organization ID when active organization changes
  useEffect(() => {
    if (activeOrganization?.id) {
      form.setValue("organizationId", activeOrganization.id);
    }
  }, [activeOrganization, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setShowAdvanced(false);
    }
  }, [open, form]);

  // Update form when monitor type changes
  useEffect(() => {
    if (monitorType === "tcp") {
      form.setValue("httpConfig", undefined as any);
      form.setValue("tcpConfig", {
        host: "",
        port: 80,
        timeoutMs: 30000,
      });
    } else {
      form.setValue("tcpConfig", undefined as any);
      form.setValue("httpConfig", {
        url: "",
        method: "GET" as const,
        followRedirects: true,
        timeoutMs: 30000,
        ipVersion: "any" as const,
      });
    }
  }, [monitorType, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Monitor</DialogTitle>
              <DialogDescription>
                Set up a new uptime monitor to track the availability of your endpoints.
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

              {/* Monitor Type */}
              <FormField
                control={form.control}
                name="monitorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="http">HTTP/HTTPS</SelectItem>
                        <SelectItem value="tcp">TCP Port</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* HTTP Configuration */}
              {monitorType === "http" && (
                <>
                  <FormField
                    control={form.control}
                    name="httpConfig.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://api.example.com/health" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HTTP_METHODS.map((method) => (
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
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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
              {monitorType === "tcp" && (
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
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTERVAL_OPTIONS.map((option) => (
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
                      <FormDescription>Start monitoring immediately after creation</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Advanced Options */}
              {monitorType === "http" && (
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
                              <Input placeholder="Custom User Agent" {...field} />
                            </FormControl>
                            <FormDescription>Override the default user agent string</FormDescription>
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
                            <FormDescription>Additional headers to send with requests</FormDescription>
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
                              <FormDescription>Automatically follow HTTP redirects</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                disabled={createMonitor.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMonitor.isPending || isPending || !activeOrganization}>
                {createMonitor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Monitor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
