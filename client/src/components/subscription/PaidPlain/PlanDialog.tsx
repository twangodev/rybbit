import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/const";
import { getStripePrices } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanName?: string;
}

const EVENT_TIERS = [
  { events: 100_000, label: "100k" },
  { events: 250_000, label: "250k" },
  { events: 500_000, label: "500k" },
  { events: 1_000_000, label: "1M" },
  { events: 2_000_000, label: "2M" },
  { events: 5_000_000, label: "5M" },
  { events: 10_000_000, label: "10M" },
];

export function PlanDialog({ open, onOpenChange, currentPlanName }: PlanDialogProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const stripePrices = getStripePrices();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!activeOrg) {
      toast.error("Please select an organization");
      return;
    }

    setLoadingPriceId(priceId);
    try {
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/settings/organization/subscription?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/settings/organization/subscription`;

      const response = await fetch(`${BACKEND_URL}/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl,
          organizationId: activeOrg.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Checkout URL not received.");
      }
    } catch (error: any) {
      toast.error(`Checkout failed: ${error.message}`);
      setLoadingPriceId(null);
    }
  };

  const getPriceForTier = (events: number, planType: "standard" | "pro") => {
    const suffix = isAnnual ? "-annual" : "";
    const planName = `${planType}${events >= 1_000_000 ? events / 1_000_000 + "m" : events / 1_000 + "k"}${suffix}`;
    const plan = stripePrices.find(p => p.name === planName);
    return plan;
  };

  const isCurrentPlan = (planName: string) => {
    return currentPlanName === planName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
        </DialogHeader>

        {/* Billing toggle */}
        <div className="flex justify-center mb-0">
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-4 py-2 rounded-full transition-colors cursor-pointer",
                !isAnnual ? "bg-emerald-500/20 text-emerald-400 font-medium" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-4 py-2 rounded-full transition-colors cursor-pointer",
                isAnnual ? "bg-emerald-500/20 text-emerald-400 font-medium" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Annual
              <span className="ml-1 text-xs text-emerald-500">-17%</span>
            </button>
          </div>
        </div>

        {/* Plan columns */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { type: "standard" as const, title: "Standard", subtitle: "Core analytics features" },
            { type: "pro" as const, title: "Pro", subtitle: "Advanced features + session replays" },
          ].map(({ type, title, subtitle }) => (
            <div key={type} className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-neutral-400">{subtitle}</p>
              </div>
              <div className="space-y-2">
                {EVENT_TIERS.map(tier => {
                  const plan = getPriceForTier(tier.events, type);
                  if (!plan) return null;
                  const isCurrent = isCurrentPlan(plan.name);
                  const isLoading = loadingPriceId === plan.priceId;

                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "flex flex-col gap-2 justify-between p-3 rounded-lg border cursor-pointer",
                        isCurrent
                          ? "bg-emerald-500/10 border-emerald-500"
                          : "bg-neutral-800/20 border-neutral-700/50 hover:bg-neutral-800/30",
                        isLoading && "opacity-50"
                      )}
                      onClick={() => handleCheckout(plan.priceId, plan.name)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Badge variant="success">{type === "pro" ? "Pro" : "Standard"}</Badge>
                        <div className="text-xs text-neutral-400">
                          <span className="text-neutral-200 font-semibold text-base">
                            ${isAnnual ? Math.round(plan.price / 12) : plan.price}
                          </span>{" "}
                          / month
                        </div>
                      </div>
                      <div className="text-neutral-100 font-medium flex items-center gap-2">
                        {tier.label} events <span className="text-neutral-400 text-xs font-normal">/ month</span>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Features comparison link */}
        <div className="mt-3 text-center">
          <a
            href="https://www.rybbit.io/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-200 hover:text-neutral-100 text-sm underline"
          >
            View detailed feature comparison →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
