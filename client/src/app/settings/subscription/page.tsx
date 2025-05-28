"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProPlan } from "./components/ProPlan";
import { useStripeSubscription } from "./utils/useStripeSubscription";
import { NoOrganization } from "../../../components/NoOrganization";
import { TrialPlan } from "./components/TrialPlan";
import { ExpiredTrialPlan } from "./components/ExpiredTrialPlan";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { FreePlan } from "./components/FreePlan";
import { Building } from "lucide-react";
import { authClient } from "@/lib/auth";

export default function SubscriptionPage() {
  useSetPageTitle("Rybbit · Subscription");
  const { data: activeSubscription, isLoading: isLoadingSubscription } =
    useStripeSubscription();

  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  // Check if the current user is an owner by looking at the members in the active organization
  const currentUserMember = activeOrg?.members?.find(
    (member) => member.userId === session?.user?.id
  );
  const isOwner = currentUserMember?.role === "owner";

  const isLoading = isLoadingSubscription;

  // Determine which plan to display
  const renderPlanComponent = () => {
    if (!activeOrg) {
      return (
        <NoOrganization message="You need to select an organization to manage your subscription." />
      );
    }

    if (!isOwner) {
      return (
        <Card className="p-6 flex flex-col items-center text-center w-full">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mb-2 text-xl">Not an owner</CardTitle>
          <CardDescription className="mb-6">
            Only the owner of the organization can manage the subscription.
          </CardDescription>
        </Card>
      );
    }

    if (!activeSubscription) {
      return <ExpiredTrialPlan />;
    }

    // Check if trial expired
    if (activeSubscription.status === "expired") {
      return <ExpiredTrialPlan message={activeSubscription.message} />;
    }

    // Check if user is on free plan
    if (activeSubscription.status === "free") {
      return <FreePlan />;
    }

    if (activeSubscription.isTrial) {
      return <TrialPlan />;
    }

    return <ProPlan />;
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-20 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      ) : (
        renderPlanComponent()
      )}
    </div>
  );
}
