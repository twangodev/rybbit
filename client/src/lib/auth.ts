import {
  adminClient,
  organizationClient,
  emailOTPClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { defaultStatements, adminAc, ownerAc, memberAc } from "better-auth/plugins/organization/access";
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  ...defaultStatements,
  apiKey: ["view"],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  apiKey: ["view"],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  apiKey: ["view"],
  ...adminAc.statements,
});

const member = ac.newRole({
  ...memberAc.statements,
});

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  plugins: [
    adminClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    emailOTPClient()
  ],
  fetchOptions: {
    credentials: "include",
  },
  socialProviders: ["google", "github", "twitter"],
});
