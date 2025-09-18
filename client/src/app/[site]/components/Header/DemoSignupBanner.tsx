"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";

export function DemoSignupBanner() {
  // Only show on demo.rybbit.io and not in an iframe
  if (typeof window === "undefined" || window.location.host !== "demo.rybbit.io") {
    return null;
  }

  // Don't show if in an iframe
  if (window.self !== window.top) {
    return null;
  }

  return (
    <div className="mt-4 px-4 py-3 rounded-lg border border-purple-100 dark:border-purple-400/30 bg-purple-50/80 dark:bg-purple-900/20 text-sm flex gap-4 items-center">
      <div className="text-purple-700 dark:text-purple-300 flex items-center font-medium">
        <Sparkles className="mr-2 h-4 w-4" />
        <span>Enjoying the demo? Get started with your own analytics dashboard!</span>
      </div>
      <Button variant="success" size="sm" asChild>
        <Link href="https://app.rybbit.io/signup" target="_blank" rel="noopener">
          Sign Up <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
