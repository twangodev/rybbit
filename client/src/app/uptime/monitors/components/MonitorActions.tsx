import { Edit2, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogHeader,
} from "../../../../components/ui/alert-dialog";
import { UptimeMonitor, useDeleteMonitor } from "../../../../api/uptime/monitors";
import { MonitorDialog } from "./dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MonitorActions({ monitor }: { monitor?: UptimeMonitor }) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMonitor = useDeleteMonitor();

  const handleDelete = async () => {
    try {
      await deleteMonitor.mutateAsync(monitor?.id ?? 0);
      toast.success("Monitor deleted successfully");
      router.push("/uptime");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete monitor");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(true)} className="flex items-center gap-2">
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
      {monitor && <MonitorDialog monitor={monitor} open={showEditDialog} onOpenChange={setShowEditDialog} />}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the monitor "
              {monitor?.name ||
                (monitor?.monitorType === "http"
                  ? monitor?.httpConfig?.url
                  : `${monitor?.tcpConfig?.host}:${monitor?.tcpConfig?.port}`)}
              " and all its historical data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Delete Monitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
