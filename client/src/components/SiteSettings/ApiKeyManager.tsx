"use client";

import { Copy, Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useGenerateApiKey,
  useGetApiConfig,
  useRevokeApiKey,
} from "../../api/admin/apiKey";

interface ApiKeyManagerProps {
  siteId: number;
  disabled?: boolean;
}

export function ApiKeyManager({
  siteId,
  disabled = false,
}: ApiKeyManagerProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // API key hooks
  const { data: apiConfig, isLoading: isLoadingApiConfig } =
    useGetApiConfig(siteId);
  const generateApiKey = useGenerateApiKey();
  const revokeApiKey = useRevokeApiKey();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">API Key</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Use an API key to track events from any environment, including
          localhost and server-side applications. API keys bypass origin
          validation.
        </p>
      </div>

      {isLoadingApiConfig ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : apiConfig?.hasApiKey || apiKey ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey || "••••••••••••••••••••••••••••••••"}
                  readOnly
                  className="pr-20 font-mono text-xs"
                />
                <div className="absolute right-1 top-1 flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-7 px-2"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  {apiKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        toast.success("API key copied to clipboard");
                      }}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {apiKey && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Copy this API key now. You won't be
                able to see it again.
              </p>
            </div>
          )}

          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={disabled || revokeApiKey.isPending}
                >
                  Revoke API Key
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately invalidate the current API key. Any
                    applications using this key will stop working.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await revokeApiKey.mutateAsync(siteId);
                        setApiKey(null);
                        setShowApiKey(false);
                        toast.success("API key revoked successfully");
                      } catch (error) {
                        toast.error("Failed to revoke API key");
                      }
                    }}
                    variant="destructive"
                  >
                    Revoke Key
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No API key has been generated for this site.
          </p>
          <Button
            onClick={async () => {
              try {
                const result = await generateApiKey.mutateAsync(siteId);
                if (result.apiKey) {
                  setApiKey(result.apiKey);
                  setShowApiKey(true);
                  toast.success("API key generated successfully");
                }
              } catch (error) {
                toast.error("Failed to generate API key");
              }
            }}
            disabled={disabled || generateApiKey.isPending}
          >
            <Key className="h-4 w-4 mr-2" />
            Generate API Key
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-neutral-700 space-y-3">
        <h5 className="text-xs font-semibold text-foreground">Usage Example</h5>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
          {`<script
  defer
  src="${window.location.origin}/api/script.js"
  data-site-id="${siteId}"
  data-api-key="YOUR_API_KEY">
</script>`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Learn more about{" "}
          <a
            href="https://docs.rybbit.io/api-key-tracking"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            API key tracking
          </a>
          .
        </p>
      </div>
    </div>
  );
}
