"use client";

import { StandardPage } from "@/components/StandardPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Sites } from "./components/sites/Sites";
import { Users } from "./components/users/Users";
import { Organizations } from "./components/organizations/Organizations";
import { AdminLayout } from "./components/shared/AdminLayout";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("organizations");

  return (
    <StandardPage>
      <AdminLayout title="Admin Dashboard">
        <Tabs defaultValue="organizations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Users />
          </TabsContent>

          <TabsContent value="organizations">
            <Organizations />
          </TabsContent>

          <TabsContent value="sites">
            <Sites />
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-4 border rounded-md">
              <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </StandardPage>
  );
}
