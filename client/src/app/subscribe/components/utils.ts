// Common utility functions and constants for subscription components

export interface StripePrice {
  priceId: string;
  price: number;
  name: string;
  interval: string;
  limits: {
    events: number;
  };
}

export const EVENT_TIERS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000, "Custom"];

export const PRO_FEATURES = [
  "Unlimited websites",
  "Unlimited team members",
  "Session replays",
  "Real-time analytics",
  "Web vitals",
  "Custom events",
  "Funnels",
  "Goals",
  "Journeys",
  "User profiles",
  "Retention",
  "All features",
];

// Find the appropriate price for a tier at current event limit
export function findPriceForTier(
  eventLimit: number | string,
  interval: "month" | "year",
  stripePrices: StripePrice[]
): StripePrice | null {
  // Check if we have a custom tier
  if (eventLimit === "Custom") {
    return null;
  }

  // Convert eventLimit to number to ensure type safety
  const eventLimitValue = Number(eventLimit);

  // Determine if we need to look for annual plans
  const isAnnual = interval === "year";

  // Filter plans by name pattern (with or without -annual suffix) and interval
  const plans = stripePrices.filter(
    (plan) =>
      (isAnnual
        ? plan.name.startsWith("pro") && plan.name.includes("-annual")
        : plan.name.startsWith("pro") && !plan.name.includes("-annual")) && plan.interval === interval
  );

  // Find a plan that matches or exceeds the event limit
  const matchingPlan = plans.find((plan) => plan.limits.events >= eventLimitValue);
  const selectedPlan = matchingPlan || plans[plans.length - 1] || null;

  // Return the matching plan or the highest tier available
  return selectedPlan;
}

// Format event tier for display
export function formatEventTier(tier: number | string): string {
  if (typeof tier === "string") {
    return tier;
  }

  return tier >= 1_000_000 ? `${tier / 1_000_000}M` : `${tier / 1_000}K`;
}
