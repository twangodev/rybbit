import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStripeSubscription } from "../app/settings/subscription/utils/useStripeSubscription";
import { Button } from "./ui/button";

export function FreePlanBanner() {
  const { data: subscription } = useStripeSubscription();

  // Don't show the banner if no subscription data or if there's a paid subscription
  if (!subscription) {
    return null;
  }

  // Format numbers with commas
  const formatNumber = (num: number = 0) => {
    return num.toLocaleString();
  };

  // Active trial banner - slightly more visible but still minimal
  if (subscription.planName === "free") {
    const eventLimit = subscription.eventLimit || 100000;
    const eventsUsed = subscription.monthlyEventCount || 0;

    return (
      <div className="mt-4 px-4 py-3 rounded-lg border border-blue-100 dark:border-blue-400/30 bg-blue-50/80 dark:bg-blue-900/20 text-sm flex justify-between items-center">
        <div className="text-blue-700 dark:text-blue-300 flex items-center font-medium">
          <span>
            Free plan: Using <strong>{formatNumber(eventsUsed)}</strong> of{" "}
            {formatNumber(eventLimit)} events
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-800/30 border-blue-200 dark:border-blue-800/50"
          asChild
        >
          <Link href="/subscribe">
            Upgrade <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}
