import { ArrowRight, FileText, MousePointerClick } from "lucide-react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { GetSessionsResponse, useGetSessionsInfinite } from "../../../../api/analytics/userSessions";
import { Channel } from "../../../../components/Channel";
import {
  BrowserTooltipIcon,
  CountryFlagTooltipIcon,
  DeviceTypeTooltipIcon,
  OperatingSystemTooltipIcon,
} from "../../../../components/TooltipIcons/TooltipIcons";
import { Badge } from "../../../../components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { formatShortDuration, hour12, userLocale } from "../../../../lib/dateTimeUtils";
import { formatter } from "../../../../lib/utils";

// Function to truncate path for display
function truncatePath(path: string, maxLength: number = 32) {
  if (!path) return "-";
  if (path.length <= maxLength) return path;

  // Keep the beginning of the path with ellipsis
  return `${path.substring(0, maxLength)}...`;
}

function SessionCard({ session }: { session: GetSessionsResponse[number] }) {
  // Calculate session duration in minutes
  const start = DateTime.fromSQL(session.session_start);
  const end = DateTime.fromSQL(session.session_end);
  const totalSeconds = Math.floor(end.diff(start).milliseconds / 1000);
  const duration = formatShortDuration(totalSeconds);

  return (
    <div className="rounded-lg bg-neutral-850 border border-neutral-800 overflow-hidden p-2 space-y-2">
      <div className="flex justify-between border-b border-neutral-700 pb-2">
        <div className="flex space-x-2 items-center text-sm font-medium">Placeholder Name</div>
        <div className="flex space-x-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="text-gray-400">
              {DateTime.fromSQL(session.session_start, {
                zone: "utc",
              })
                .setLocale(userLocale)
                .toLocal()
                .toFormat(hour12 ? "MMM d, h:mm a" : "dd MMM, HH:mm")}
            </span>
            <span className="text-gray-400">•</span>
            <span className="hidden md:block">{duration}</span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        {session.country && (
          <CountryFlagTooltipIcon country={session.country} city={session.city} region={session.region} />
        )}
        <BrowserTooltipIcon browser={session.browser || "Unknown"} browser_version={session.browser_version} />
        <OperatingSystemTooltipIcon
          operating_system={session.operating_system || ""}
          operating_system_version={session.operating_system_version}
        />
        <DeviceTypeTooltipIcon
          device_type={session.device_type || ""}
          screen_width={session.screen_width}
          screen_height={session.screen_height}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="flex items-center gap-1 bg-neutral-800 text-gray-300">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>{formatter(session.pageviews)}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Pageviews</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="flex items-center gap-1 bg-neutral-800 text-gray-300">
              <MousePointerClick className="w-4 h-4 text-amber-500" />
              <span>{formatter(session.events)}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Events</TooltipContent>
        </Tooltip>
        <Channel channel={session.channel} referrer={session.referrer} />
      </div>
      <div className="items-center flex-1 min-w-0 hidden md:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-gray-400 truncate max-w-[200px] inline-block">
              {truncatePath(session.entry_page)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{session.entry_page || "-"}</p>
          </TooltipContent>
        </Tooltip>

        <ArrowRight className="mx-2 w-3 h-3 flex-shrink-0 text-gray-400" />

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-gray-400 truncate max-w-[200px] inline-block">
              {truncatePath(session.exit_page)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{session.exit_page || "-"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function GlobeSessions() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetSessionsInfinite();

  // Combine all pages of data
  const flattenedData = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data || []);
  }, [data]);

  return (
    <div className="space-y-2 bg-neutral-900 p-2 rounded-lg w-[371px]">
      <div className="text-sm text-gray-400">Sessions</div>
      <div className="space-y-2 max-h-[80vh] overflow-y-auto">
        {flattenedData.map(session => (
          <SessionCard key={session.session_id} session={session} />
        ))}
      </div>
    </div>
  );
}
