"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateTime } from "luxon";
import { useGetSiteImports, useImportSiteData } from "@/api/sites";

export function ImportManager({ siteId, disabled }: { siteId: number, disabled: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [source] = useState("umami"); // Default to umami, can be extended later

  const { data, isLoading, error } = useGetSiteImports(siteId);
  const mutation = useImportSiteData(siteId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      mutation.mutate({ file, source });
      setFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Import Data</h3>
        <p className="text-sm text-muted-foreground">
          Import site data from other analytics platforms.
        </p>
      </div>
      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="file">CSV File</Label>
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={disabled}/>
        </div>
        <Button onClick={handleImport} disabled={!file || mutation.isPending || disabled}>
          {mutation.isPending ? "Importing..." : "Import"}
        </Button>
        {mutation.isError && (
          <p className="text-sm text-red-500">
            {mutation.error.message}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium">Import History</h3>
        {isLoading ? (
          <p>Loading import history...</p>
        ) : error ? (
          <p className="text-sm text-red-500">
            Failed to load import history.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.imports?.map((imp) => (
                <TableRow key={imp.importId}>
                  <TableCell>{imp.fileName}</TableCell>
                  <TableCell>{imp.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{imp.status}</span>
                      {(imp.status === 'processing' || imp.status === 'pending') && <Progress value={50} className="w-24" />}
                    </div>
                    {imp.errorMessage && <p className="text-xs text-red-500">{imp.errorMessage}</p>}
                  </TableCell>
                  <TableCell>{imp.importedEvents ?? "N/A"}</TableCell>
                  <TableCell>{DateTime.fromISO(imp.startedAt).toRelative()}</TableCell>
                  <TableCell>{imp.completedAt ? DateTime.fromISO(imp.completedAt).toRelative() : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
