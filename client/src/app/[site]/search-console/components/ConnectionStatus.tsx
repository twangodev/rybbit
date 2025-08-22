"use client";

import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  onConnect?: () => void;
  isLoading?: boolean;
}

export function ConnectionStatus({ isConnected, onConnect, isLoading = false }: ConnectionStatusProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <h3 className="text-lg font-semibold text-white">Google Search Console</h3>
            <p className="text-sm text-neutral-400">
              {isConnected 
                ? "Connected - Your search data is being imported" 
                : "Not connected - Connect to import your search performance data"
              }
            </p>
          </div>
        </div>
        {!isConnected && (
          <Button 
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Connect"}
          </Button>
        )}
      </div>
      
      {!isConnected && (
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">How to connect:</h4>
          <ol className="text-sm text-neutral-400 space-y-1">
            <li>1. Make sure your website is verified in Google Search Console</li>
            <li>2. Click "Connect" to authorize with your Google account</li>
            <li>3. Grant permission to access your Search Console data</li>
            <li>4. Your search performance data will be imported automatically</li>
          </ol>
        </div>
      )}
    </div>
  );
}
