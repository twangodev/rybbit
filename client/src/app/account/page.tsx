"use client";

import { useSetPageTitle } from "../../hooks/useSetPageTitle";
import { StandardPage } from "../../components/StandardPage";
import { AccountInner } from "./components/AccountInner";
import { authClient } from "../../lib/auth";

export default function AccountPage() {
  useSetPageTitle("Rybbit · Account");
  const session = authClient.useSession();

  return (
    <StandardPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your personal account settings
          </p>
        </div>
        <AccountInner session={session} />
      </div>
    </StandardPage>
  );
}
