import { Clock, FileText, MousePointerClick } from "lucide-react";
import { CountryFlag } from "../Country";
import { Browser } from "../Browser";
import { OperatingSystem } from "../OperatingSystem";
import { Laptop, Smartphone } from "lucide-react";
import { Card } from "./Card";

// Mock events for the real-time analytics card
const mockEvents = [
  {
    id: 1,
    type: "pageview",
    pathname: "/pricing",
    timestamp: "2 min ago",
    country: "US",
    browser: "Chrome",
    operating_system: "Windows",
    device_type: "Desktop",
  },
  {
    id: 3,
    type: "pageview",
    pathname: "/blog/analytics-tips",
    timestamp: "just now",
    country: "DE",
    browser: "Firefox",
    operating_system: "Linux",
    device_type: "Mobile",
  },
];

// EventCard component for Real-time Analytics
function EventCard({ event }) {
  const isPageview = event.type === "pageview";

  return (
    <div className="mb-3 rounded-lg bg-neutral-800/50 border border-neutral-700 overflow-hidden p-3 flex flex-col">
      <div className="flex items-center gap-2 text-sm text-neutral-100 mb-2">
        <div className="flex items-center gap-2">
          {isPageview ? (
            <FileText className="w-4 h-4 text-blue-500" />
          ) : (
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          )}
        </div>

        <div>{isPageview ? event.pathname : event.event_name}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex space-x-2 items-center ml-6">
          <div className="flex items-center">
            <CountryFlag country={event.country} />
          </div>
          <div>
            <Browser browser={event.browser || "Unknown"} />
          </div>
          <div>
            <OperatingSystem os={event.operating_system || ""} />
          </div>
          <div>
            {event.device_type === "Mobile" ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center text-xs text-neutral-400">
          <Clock className="w-3 h-3 mr-1" />
          <span>{event.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

export function RealTimeAnalytics() {
  return (
    <Card
      title="Real-time Analytics"
      description="See your site performance as it happens with instant data updates and live visitor activity."
    >
      <div className="bg-neutral-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Live Visitors</h4>
          <span className="bg-emerald-500/20 text-emerald-400 font-medium px-2 py-1 rounded text-sm">
            28 online
          </span>
        </div>

        <div className="space-y-1">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </Card>
  );
}
