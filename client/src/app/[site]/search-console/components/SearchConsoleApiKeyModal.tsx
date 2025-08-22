"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSearchConsoleApiKey } from "../../../../api/analytics/searchConsole/useUpdateSearchConsoleApiKey";
import { ExternalLink } from "lucide-react";

interface SearchConsoleApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: number;
}

export function SearchConsoleApiKeyModal({
  isOpen,
  onClose,
  siteId,
}: SearchConsoleApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const updateApiKey = useUpdateSearchConsoleApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      return;
    }

    await updateApiKey.mutateAsync({
      siteId,
      apiKey: apiKey.trim(),
    });
    
    setApiKey("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Google Search Console</DialogTitle>
          <DialogDescription>
            Enter your Google Search Console API key to import your search performance data.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Search Console API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-white">How to get your API key:</h4>
            <ol className="text-sm text-neutral-400 space-y-1">
              <li>1. Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>2. Create a new project or select an existing one</li>
              <li>3. Enable the Search Console API</li>
              <li>4. Create credentials (API key)</li>
              <li>5. Copy the API key and paste it above</li>
            </ol>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!apiKey.trim() || updateApiKey.isPending}
          >
            {updateApiKey.isPending ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

