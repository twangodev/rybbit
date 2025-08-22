"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OAuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const siteId = params.site;
  const [errorMessage, setErrorMessage] = useState("An error occurred during authentication.");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Connection Failed</h1>
        <p className="text-neutral-400 mb-6">
          {errorMessage}
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push(`/${siteId}/search-console`)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
