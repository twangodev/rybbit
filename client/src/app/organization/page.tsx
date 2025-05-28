"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrganizationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to members page by default
    router.replace("/organization/members");
  }, [router]);

  return null;
}
