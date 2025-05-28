# Settings Refactor Implementation Plan

## Overview

Refactor the settings structure to separate user-specific account settings from organization-specific settings.

## Current Structure

```
/settings
├── /account (user-specific)
├── /organizations (org-specific)
└── /subscription (org-specific)
```

## New Structure

```
/account (user-specific settings)
└── Account settings page

/organization (org-specific settings)
├── Organization selector at top
└── Tabs:
    ├── Members (formerly /settings/organizations)
    └── Subscription (formerly /settings/subscription)
```

## Implementation Steps

### Step 1: Create Account Directory

1. Create `client/src/app/account/` directory
2. Move `client/src/app/settings/account/page.tsx` to `client/src/app/account/page.tsx`
3. Move `client/src/app/settings/account/components/` to `client/src/app/account/components/`
4. Update imports in moved files

### Step 2: Create Organization Directory

1. Create `client/src/app/organization/` directory
2. Create `client/src/app/organization/layout.tsx` with:
   - OrganizationSelector at top
   - Tabs component with "Members" and "Subscription" tabs
3. Create `client/src/app/organization/page.tsx` (redirect to members)
4. Create `client/src/app/organization/members/` directory
5. Move organizations content to members directory
6. Create `client/src/app/organization/subscription/` directory
7. Move subscription content to subscription directory

### Step 3: Update Navigation Links

Update all files that reference the old paths:

- `client/src/components/TopBar.tsx`: `/settings/account` → `/account`
- `client/src/app/subscribe/page.tsx`: `/settings/subscription` → `/organization?tab=subscription`
- `client/src/app/subscribe/components/PricingCard.tsx`: success URL update
- `client/src/app/auth/subscription/success/page.tsx`: redirect update
- Any other files with old path references

### Step 4: Remove Old Settings Structure

1. Delete `client/src/app/settings/` directory
2. Verify no broken imports remain

## File Structure After Refactor

```
client/src/app/
├── account/
│   ├── page.tsx
│   └── components/
│       ├── AccountInner.tsx
│       ├── ChangePassword.tsx
│       └── DeleteAccount.tsx
│
└── organization/
    ├── layout.tsx (with OrganizationSelector and Tabs)
    ├── page.tsx (redirects to members tab)
    ├── members/
    │   ├── page.tsx
    │   └── components/
    │       ├── AddUser.tsx
    │       ├── DeleteOrganizationDialog.tsx
    │       ├── DeleteUser.tsx
    │       ├── EditOrganizationDialog.tsx
    │       ├── Invitations.tsx
    │       ├── InviteMemberDialog.tsx
    │       └── RemoveMemberDialog.tsx
    │
    └── subscription/
        ├── page.tsx
        ├── components/
        │   ├── ExpiredTrialPlan.tsx
        │   ├── FreePlan.tsx
        │   ├── HelpSection.tsx
        │   ├── ProPlan.tsx
        │   └── TrialPlan.tsx
        └── utils/
            ├── constants.ts
            ├── planUtils.tsx
            └── useStripeSubscription.ts
```

## Key Components to Implement

### 1. Organization Layout (`/app/organization/layout.tsx`)

```tsx
"use client";

import { StandardPage } from "../../components/StandardPage";
import { OrganizationSelector } from "../../components/OrganizationSelector";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, CreditCard } from "lucide-react";
import { IS_CLOUD } from "../../lib/const";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "members";

  const handleTabChange = (value: string) => {
    router.push(`/organization?tab=${value}`);
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

          <TabsContent value="members">
            {activeTab === "members" && children}
          </TabsContent>

          {IS_CLOUD && (
            <TabsContent value="subscription">
              {activeTab === "subscription" && children}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </StandardPage>
  );
}
```

### 2. Organization Root Page (`/app/organization/page.tsx`)

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrganizationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to members tab by default
    router.replace("/organization?tab=members");
  }, [router]);

  return null;
}
```

### 3. Account Page (`/app/account/page.tsx`)

```tsx
"use client";

import { useSetPageTitle } from "../../hooks/useSetPageTitle";
import { StandardPage } from "../../components/StandardPage";
import { AccountInner } from "./components/AccountInner";

export default function AccountPage() {
  useSetPageTitle("Rybbit · Account");

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
        <AccountInner />
      </div>
    </StandardPage>
  );
}
```

## URL Changes Summary

- `/settings/account` → `/account`
- `/settings/organizations` → `/organization?tab=members`
- `/settings/subscription` → `/organization?tab=subscription`

## Files to Update with New URLs

1. `client/src/components/TopBar.tsx`
2. `client/src/app/subscribe/page.tsx`
3. `client/src/app/subscribe/components/PricingCard.tsx`
4. `client/src/app/auth/subscription/success/page.tsx`
5. Any other files referencing old settings paths

## Testing Checklist

- [ ] Account settings accessible at `/account`
- [ ] Organization members accessible at `/organization?tab=members`
- [ ] Organization subscription accessible at `/organization?tab=subscription`
- [ ] Navigation between tabs works correctly
- [ ] Organization selector works in new layout
- [ ] All imports resolved correctly
- [ ] No broken links in the application
