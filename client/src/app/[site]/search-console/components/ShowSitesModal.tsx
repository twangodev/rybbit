"use client";

import { useState } from "react";
import { X, Check, Plus, ExternalLink } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { AlertCircle, AppWindow } from "lucide-react";
import { addSite } from "../../../../api/admin/sites";
import { authClient } from "../../../../lib/auth";
import { resetStore, useStore } from "../../../../lib/store";
import { useRouter } from "next/navigation";
import { isValidDomain, normalizeDomain } from "../../../../lib/utils";

interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
  domain: string;
  isExisting: boolean;
}

interface ShowSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SearchConsoleSite[];
}

export function ShowSitesModal({ isOpen, onClose, sites }: ShowSitesModalProps) {
  const { setSite } = useStore();
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [prefilledDomain, setPrefilledDomain] = useState("");
  const [domain, setDomain] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saltUserIds, setSaltUserIds] = useState(false);
  const [error, setError] = useState("");

  const handleAddSite = (domain: string) => {
    setPrefilledDomain(domain);
    setDomain(domain);
    setAddSiteOpen(true);
  };

  const handleCloseAddSite = () => {
    setAddSiteOpen(false);
    setPrefilledDomain("");
    setDomain("");
    setError("");
    setIsPublic(false);
    setSaltUserIds(false);
  };

  const handleSubmit = async () => {
    setError("");

    if (!activeOrganization?.id) {
      setError("Please select an organization");
      return;
    }

    // Validate before attempting to add
    if (!isValidDomain(domain)) {
      setError("Invalid domain format. Must be a valid domain like example.com or sub.example.com");
      return;
    }

    try {
      const normalizedDomain = normalizeDomain(domain);
      const site = await addSite(normalizedDomain, normalizedDomain, activeOrganization.id, {
        isPublic,
        saltUserIds,
      });

      resetStore();
      setSite(site.siteId.toString());
      router.push(`/${site.siteId}`);
      handleCloseAddSite();
    } catch (error) {
      setError(String(error));
      return;
    }
  };

  const newSites = sites.filter(site => !site.isExisting);
  const existingSites = sites.filter(site => site.isExisting);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Show Sites from Search Console</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Available Sites Section */}
            {newSites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  Available Sites ({newSites.length})
                </h3>
                
                <div className="grid gap-3">
                  {newSites.map((site) => (
                    <div
                      key={site.domain}
                      className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div>
                          <div className="text-white font-medium">{site.domain}</div>
                          <div className="text-sm text-neutral-400">
                            Permission: {site.permissionLevel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddSite(site.domain)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add Site
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Sites Section */}
            {existingSites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  Already Added ({existingSites.length})
                </h3>
                
                <div className="grid gap-3">
                  {existingSites.map((site) => (
                    <div
                      key={site.domain}
                      className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <div>
                          <div className="text-white font-medium">{site.domain}</div>
                          <div className="text-sm text-neutral-400">
                            Permission: {site.permissionLevel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Check size={14} />
                          Added
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No sites message */}
            {sites.length === 0 && (
              <div className="text-center py-8">
                <div className="text-neutral-400 mb-2">No sites found in Search Console</div>
                <div className="text-sm text-neutral-500">
                  Make sure your sites are verified in Google Search Console
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4 mt-4">
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <div>
                Total sites: {sites.length} • Available: {newSites.length} • Added: {existingSites.length}
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AddSite Modal with prefilled domain */}
      <Dialog open={addSiteOpen} onOpenChange={setAddSiteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AppWindow className="h-6 w-6" />
              Add Website
            </DialogTitle>
            <DialogDescription>Track analytics for a new website in your organization</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="domain" className="text-sm font-medium text-white">
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                placeholder="example.com or sub.example.com"
              />
            </div>
            {/* Public Analytics Setting */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublic" className="text-sm font-medium text-white">
                  Public Analytics
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, anyone can view analytics without logging in
                </p>
              </div>
              <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* User ID Salting Setting */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="saltUserIds" className="text-sm font-medium text-white">
                  Enable User ID Salting
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enhance privacy with daily rotating salts for user IDs
                </p>
              </div>
              <Switch id="saltUserIds" checked={saltUserIds} onCheckedChange={setSaltUserIds} />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Adding Website</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" onClick={handleCloseAddSite} variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant={"success"} onClick={handleSubmit} disabled={!domain}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
