"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { DateTime } from "luxon";
import { useGetSiteImports, useImportSiteData } from "@/api/admin/import";
import { SplitDateRangePicker, DateRange, formatDateRange } from "@/components/SplitDateRangePicker";

interface ImportManagerProps {
  siteId: number;
  disabled: boolean;
}

interface FileValidationError {
  type: "size" | "type" | "name";
  message: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = ["text/csv"];
const ALLOWED_EXTENSIONS = [".csv"];

export function ImportManager({ siteId, disabled }: ImportManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<"umami" | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [fileError, setFileError] = useState<FileValidationError | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useGetSiteImports(siteId);
  const mutation = useImportSiteData(siteId);

  const validateFile = (file: File): FileValidationError | null => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        type: "size",
        message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 100MB.`
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") {
      return {
        type: "type",
        message: "Invalid file type. Only CSV files are accepted."
      };
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        type: "type",
        message: "Invalid file extension. Only .csv files are accepted."
      };
    }

    if (file.name.length > 255) {
      return {
        type: "name",
        message: "Filename is too long. Please use a shorter filename."
      };
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFileError(null);

    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setFileError(validationError);
        setFile(null);
        event.target.value = "";
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleImportClick = () => {
    if (file && file.size > 50 * 1024 * 1024) {
      setShowConfirmDialog(true);
    } else {
      handleImport();
    }
  };

  const handleImport = () => {
    if (file && source) {
      const formattedDateRange = formatDateRange(dateRange);

      mutation.mutate({
        file,
        source,
        ...formattedDateRange
      });
      setFile(null);
      setShowConfirmDialog(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle2,
          label: "Completed"
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertCircle,
          label: "Failed"
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Loader2,
          label: "Processing"
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          label: "Pending"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock,
          label: status
        };
    }
  };

  const sortedImports = useMemo(() => {
    if (!data?.data) return [];

    return [...data.data].sort((a, b) => {
      const aTime = new Date(a.startedAt).getTime();
      const bTime = new Date(b.startedAt).getTime();
      return bTime - aTime;
    });
  }, [data?.data]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const hasActiveImports = useMemo(() => {
    return data?.data.some(imp =>
      imp.status === "processing" || imp.status === "pending"
    ) ?? false;
  }, [data?.data]);

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import site data from other analytics platforms. Supports CSV files up to 100MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Picker */}
          <SplitDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            label="Date Range (Optional)"
            disabled={disabled || mutation.isPending}
            showDescription={true}
            clearButtonText="Clear dates"
            className="space-y-2"
          />

          <Separator />

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV File
            </Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={disabled || mutation.isPending}
              aria-describedby={fileError ? "file-error" : undefined}
            />
            {file && !fileError && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          {/* File Validation Error */}
          {fileError && (
            <Alert variant="destructive" id="file-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {fileError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Import Button */}
          <Button
            onClick={handleImportClick}
            disabled={!file || mutation.isPending || disabled || !!fileError}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>

          {/* Import Error */}
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error?.message || "Failed to import file. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {mutation.isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File uploaded successfully and is being processed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Track the status of your data imports
            {hasActiveImports && " - Updates automatically every 5 seconds"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading import history...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load import history. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : !data?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No imports yet</p>
              <p className="text-sm">Upload a CSV file to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedImports.map((imp) => {
                    const statusInfo = getStatusInfo(imp.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={imp.importId}>
                        <TableCell className="font-medium">
                          <div className="max-w-[200px] truncate" title={imp.fileName}>
                            {imp.fileName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {imp.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className={`${statusInfo.color} flex items-center gap-1 w-fit`}
                            >
                              <StatusIcon
                                className={`h-3 w-3 ${
                                  imp.status === "processing" ? "animate-spin" : ""
                                }`}
                              />
                              {statusInfo.label}
                            </Badge>
                            {imp.errorMessage && (
                              <p className="text-xs text-red-600 max-w-[200px] truncate" title={imp.errorMessage}>
                                {imp.errorMessage}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {imp.importedEvents?.toLocaleString() ?? "—"}
                        </TableCell>
                        <TableCell>
                          <time
                            dateTime={imp.startedAt}
                            title={DateTime.fromISO(imp.startedAt).toLocaleString(DateTime.DATETIME_FULL)}
                          >
                            {DateTime.fromISO(imp.startedAt).toRelative()}
                          </time>
                        </TableCell>
                        <TableCell>
                          {imp.completedAt ? (
                            <time
                              dateTime={imp.completedAt}
                              title={DateTime.fromISO(imp.completedAt).toLocaleString(DateTime.DATETIME_FULL)}
                            >
                              {DateTime.fromISO(imp.completedAt).toRelative()}
                            </time>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Large File Import</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to import a large file ({file && formatFileSize(file.size)}).
              This may take several minutes to process. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Yes, Import File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
