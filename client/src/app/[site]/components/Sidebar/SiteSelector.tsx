import { Check, ChevronDown, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useGetSite, useGetSitesFromOrg } from "../../../../api/admin/sites";
import { Favicon } from "../../../../components/Favicon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { Button } from "../../../../components/ui/button";
import { authClient } from "../../../../lib/auth";
import { resetStore, useStore } from "../../../../lib/store";
import { userStore } from "../../../../lib/userStore";
import { cn, formatter } from "../../../../lib/utils";
import { AddSite } from "../../../components/AddSite";

function SiteSelectorContent({ onSiteSelect }: { onSiteSelect: () => void }) {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: sites } = useGetSitesFromOrg(activeOrganization?.id);
  const { setSite } = useStore();

  const pathname = usePathname();
  const router = useRouter();
  const currentSiteId = Number(pathname.split("/")[1]);

  return (
    <PopoverContent align="start" className="w-80 p-2">
      <div className="max-h-96 overflow-y-auto">
        {sites?.sites
          ? sites.sites.map((site) => {
              const isSelected = site.siteId === currentSiteId;
              return (
                <div
                  key={site.siteId}
                  onClick={() => {
                    if (isSelected) {
                      onSiteSelect(); // Close popover even if same site
                      return;
                    }
                    resetStore();
                    setSite(site.siteId.toString());
                    router.push(`/${site.siteId}`);
                    onSiteSelect(); // Close popover immediately
                  }}
                  className={cn(
                    "flex items-center justify-between p-2 cursor-pointer hover:bg-neutral-800/50 transition-colors rounded-md border-b border-neutral-800 last:border-b-0",
                    isSelected && "bg-neutral-800"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Favicon
                      domain={site.domain}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <div className="text-sm text-white truncate">
                      {site.domain}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-neutral-300 whitespace-nowrap">
                      {formatter(site.sessionsLast24Hours)} sessions (24h)
                    </div>
                  </div>
                </div>
              );
            })
          : Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex items-center justify-between p-2 animate-pulse rounded-md border-b border-neutral-800 last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-4 h-4 bg-neutral-700 rounded flex-shrink-0"></div>
                  <div className="h-4 bg-neutral-700 rounded w-32"></div>
                </div>
                <div className="h-3 bg-neutral-700 rounded w-20"></div>
              </div>
            ))}
      </div>

      {/* Add Site Section */}
      <div className="border-t border-neutral-800 pt-2 mt-2">
        <AddSite
          trigger={
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Add New Site
            </Button>
          }
        />
      </div>
    </PopoverContent>
  );
}

export function SiteSelector() {
  const { user } = userStore();
  const { site: currentSite } = useStore();
  const { data: site } = useGetSite(currentSite);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {site ? (
          <button className="flex gap-2 items-center border border-neutral-800 rounded-lg py-1.5 px-3 justify-start cursor-pointer hover:bg-neutral-800/50 transition-colors h-[36px] w-full">
            <Favicon domain={site.domain} className="w-5 h-5" />
            <div className="text-white truncate text-sm flex-1 text-left">
              {site.domain}
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
        ) : (
          <button className="flex gap-2 border border-neutral-800 rounded-lg py-1.5 px-3 justify-start items-center h-[36px] w-full animate-pulse">
            <div className="w-5 h-5 bg-neutral-800 rounded"></div>
            <div className="h-4 bg-neutral-800 rounded w-24 flex-1"></div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </PopoverTrigger>
      {user && <SiteSelectorContent onSiteSelect={() => setOpen(false)} />}
    </Popover>
  );
}
