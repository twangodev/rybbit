import { Laptop, Smartphone } from "lucide-react";
import { Browser } from "../../app/[site]/components/shared/icons/Browser";
import { CountryFlag } from "../../app/[site]/components/shared/icons/CountryFlag";
import { OperatingSystem } from "../../app/[site]/components/shared/icons/OperatingSystem";
import { getRegionName } from "../../lib/geo";
import { getCountryName } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// DeviceIcon component for displaying mobile/desktop icons
function DeviceIcon({ deviceType }: { deviceType: string }) {
  const type = deviceType.toLowerCase();

  if (type.includes("mobile") || type.includes("tablet")) {
    return <Smartphone className="w-4 h-4" />;
  }

  return <Laptop className="w-4 h-4" />;
}

export function CountryFlagTooltipIcon({
  country,
  city,
  region,
}: {
  country: string;
  city: string;
  region: string;
}) {
  const getFullLocation = <
    T extends { country: string; city: string; region: string }
  >(
    session: T
  ) => {
    let location = "";
    if (session.city) {
      location += `${session.city}, `;
    }
    if (getRegionName(session.region)) {
      location += `${getRegionName(session.region)}, `;
    }
    if (session.country) {
      location += getCountryName(session.country);
    }
    return location;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          <CountryFlag country={country} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getFullLocation({ country, city, region })}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function BrowserTooltipIcon({
  browser,
  browser_version,
}: {
  browser: string;
  browser_version?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex-shrink-0">
          <Browser browser={browser || "Unknown"} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {browser || "Unknown browser"}
          {browser_version && ` ${browser_version}`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function OperatingSystemTooltipIcon({
  operating_system,
  operating_system_version,
}: {
  operating_system: string;
  operating_system_version?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex-shrink-0">
          <OperatingSystem os={operating_system || ""} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {operating_system || "Unknown OS"}
          {operating_system_version && ` ${operating_system_version}`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function DeviceTypeTooltipIcon({
  device_type,
  screen_width,
  screen_height,
}: {
  device_type: string;
  screen_width?: number;
  screen_height?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <DeviceIcon deviceType={device_type || ""} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {device_type || "Unknown device"}
          {screen_width && screen_height && ` ${screen_width}x${screen_height}`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
