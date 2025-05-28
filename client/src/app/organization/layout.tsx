"use client";

import { StandardPage } from "../../components/StandardPage";
import { OrganizationSelector } from "../../components/OrganizationSelector";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Users, CreditCard } from "lucide-react";
import { IS_CLOUD } from "../../lib/const";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  const activeTab = pathname.includes("/subscription")
    ? "subscription"
    : "members";

  const handleTabChange = (value: string) => {
    if (value === "members") {
      router.push("/organization/members");
    } else if (value === "subscription") {
      router.push("/organization/subscription");
    }
  };

  return (
    <StandardPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your organization settings and members
          </p>
        </div>

        <OrganizationSelector />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users size={16} />
              Members
            </TabsTrigger>
            {IS_CLOUD && (
              <TabsTrigger
                value="subscription"
                className="flex items-center gap-2"
              >
                <CreditCard size={16} />
                Subscription
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="mt-6">{children}</div>
      </div>
    </StandardPage>
  );
}
