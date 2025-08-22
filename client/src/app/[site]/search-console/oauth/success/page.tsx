"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.site;

  useEffect(() => {
    // Redirect back to search console page after 3 seconds
    const timer = setTimeout(() => {
      router.push(`/${siteId}/search-console`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, siteId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Successfully Connected!</h1>
        <p className="text-neutral-400 mb-4">
          Your Google Search Console account has been connected successfully.
        </p>
        <p className="text-sm text-neutral-500">
          Redirecting back to Search Console...
        </p>
      </div>
    </div>
  );
}
