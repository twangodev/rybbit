"use client";

import { useState, useEffect } from "react";
import { StandardPage } from "@/components/StandardPage";
import { Users } from "./components/users/Users";
import { Sites } from "./components/sites/Sites";
import { OrgUsersList } from "./components/users/OrgUsersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    async function checkAdminPermission() {
      try {
        // Check if the user has admin access
        const result = await authClient.admin.hasPermission({
          permissions: {
            user: ["impersonate"],
          },
        });
        setIsAdmin(result.data?.success ?? false);
        setIsCheckingAdmin(false);
      } catch (err) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        console.error("Error checking admin status:", err);
      }
    }

    checkAdminPermission();
  }, []);

  // If not admin, show access denied
  if (!isAdmin && !isCheckingAdmin) {
    return (
      <div className="container mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. Please contact an
            administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <StandardPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="org-users">Organization Owners</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Users />
        </TabsContent>

        <TabsContent value="org-users">
          <OrgUsersList />
        </TabsContent>

        <TabsContent value="sites">
          <Sites />
        </TabsContent>

        <TabsContent value="settings">
          <div className="p-4 border rounded-md">
            <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
            <p className="text-muted-foreground">
              Settings panel coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </StandardPage>
  );
}
