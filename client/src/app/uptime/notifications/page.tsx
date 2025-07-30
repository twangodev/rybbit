"use client";

import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Bell, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  NotificationChannel,
  useDeleteChannel,
  useNotificationChannels,
  useTestChannel,
  useUpdateChannel,
} from "../../../api/uptime/notifications";
import { StandardPage } from "../../../components/StandardPage";
import { NotificationDialog } from "./components/NotificationDialog";
import { CHANNEL_CONFIG } from "./constants";
import { useNotificationsStore } from "./notificationsStore";

type ChannelType = NotificationChannel["type"];

export default function NotificationsPage() {
  const { data, isLoading } = useNotificationChannels();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();
  const testChannel = useTestChannel();
  const { openDialog } = useNotificationsStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<NotificationChannel | null>(null);

  const handleToggleChannel = async (channel: NotificationChannel) => {
    try {
      await updateChannel.mutateAsync({
        id: channel.id,
        data: { enabled: !channel.enabled },
      });
      toast.success(channel.enabled ? "Channel disabled" : "Channel enabled");
    } catch (error) {
      toast.error("Failed to update channel");
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    try {
      await deleteChannel.mutateAsync(channelToDelete.id);
      toast.success("Channel deleted");
      setChannelToDelete(null);
    } catch (error) {
      toast.error("Failed to delete channel");
      throw error; // Re-throw to show error in modal
    }
  };

  const openDeleteModal = (channel: NotificationChannel) => {
    setChannelToDelete(channel);
    setDeleteModalOpen(true);
  };

  const handleTestChannel = async (channel: NotificationChannel) => {
    try {
      await testChannel.mutateAsync(channel.id);
      toast.success("Test notification sent");
    } catch (error) {
      toast.error("Failed to send test notification");
    }
  };

  const openCreateDialog = (type: ChannelType) => {
    if (CHANNEL_CONFIG[type].disabled) {
      toast.info("This channel type is coming soon");
      return;
    }
    openDialog(type);
  };

  return (
    <StandardPage showSidebar={false}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-neutral-500 mt-1">Configure how you want to be notified about monitor incidents</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Object.entries(CHANNEL_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={type}
              className={cn(
                "bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between"
              )}
              onClick={() => openCreateDialog(type as ChannelType)}
            >
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4")} />
                  <span className="text-base">{config.title}</span>
                </CardTitle>
                <CardDescription>
                  {config.description}
                  {config.disabled && " - Coming soon"}
                </CardDescription>
              </div>
              <Button variant="success" disabled={config.disabled}>
                Create
              </Button>
            </div>
          );
        })}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Active Channels</h2>
        {isLoading ? (
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ) : data?.channels?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-neutral-500">
              No notification channels configured yet
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.channels?.map((channel) => {
                  const config = CHANNEL_CONFIG[channel.type];
                  const Icon = config.icon;
                  return (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {channel.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{channel.type}</span>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {channel.type === "email" && channel.config?.email}
                        {channel.type === "discord" && "Discord webhook"}
                        {channel.type === "slack" && `Slack ${channel.config?.slackChannel || "webhook"}`}
                        {channel.type === "sms" && channel.config?.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <Switch checked={channel.enabled} onCheckedChange={() => handleToggleChannel(channel)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestChannel(channel)}
                            disabled={!channel.enabled}
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteModal(channel)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
      <NotificationDialog />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        onConfirm={handleDeleteChannel}
        title="Delete Notification Channel"
        description={
          channelToDelete ? (
            <>
              Are you sure you want to delete the notification channel <strong>{channelToDelete.name}</strong>? This
              action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this notification channel?"
          )
        }
        primaryAction={{
          children: "Delete Channel",
          variant: "destructive",
        }}
      />
    </StandardPage>
  );
}
