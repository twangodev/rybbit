import {
  AppWindow,
  Brain,
  FileText,
  FolderInput,
  Globe,
  Languages,
  Link,
  LogIn,
  LogOut,
  MapPinHouse,
  MapPinned,
  Maximize,
  MousePointerClick,
  Radio,
  Search,
  Target,
  TabletSmartphone,
  Megaphone,
  Flag,
  Puzzle,
} from "lucide-react";
import { Card } from "./Card";

const FilterOptions = [
  {
    label: "Path",
    value: "pathname",
    icon: <FolderInput className="h-4 w-4" />,
  },
  {
    label: "Page Title",
    value: "page_title",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Query",
    value: "querystring",
    icon: <Search className="h-4 w-4" />,
  },
  {
    label: "Event Name",
    value: "event_name",
    icon: <MousePointerClick className="h-4 w-4" />,
  },
  {
    label: "Referrer",
    value: "referrer",
    icon: <Link className="h-4 w-4" />,
  },
  {
    label: "Channel",
    value: "channel",
    icon: <Radio className="h-4 w-4" />,
  },
  {
    label: "Entry Page",
    value: "entry_page",
    icon: <LogIn className="h-4 w-4" />,
  },
  {
    label: "Exit Page",
    value: "exit_page",
    icon: <LogOut className="h-4 w-4" />,
  },
  {
    label: "Country",
    value: "country",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    label: "Region",
    value: "region",
    icon: <MapPinned className="h-4 w-4" />,
  },
  {
    label: "City",
    value: "city",
    icon: <MapPinHouse className="h-4 w-4" />,
  },
  {
    label: "Device Type",
    value: "device_type",
    icon: <TabletSmartphone className="h-4 w-4" />,
  },
  {
    label: "Operating System",
    value: "operating_system",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    label: "Browser",
    value: "browser",
    icon: <AppWindow className="h-4 w-4" />,
  },
  {
    label: "Language",
    value: "language",
    icon: <Languages className="h-4 w-4" />,
  },
  {
    label: "Screen Dimensions",
    value: "dimensions",
    icon: <Maximize className="h-4 w-4" />,
  },
  {
    label: "UTM Source",
    value: "utm_source",
    icon: <Target className="h-4 w-4" />,
  },
  {
    label: "UTM Medium",
    value: "utm_medium",
    icon: <Megaphone className="h-4 w-4" />,
  },
];

export function AdvancedFilters() {
  return (
    <Card 
      title="Advanced Filters"
      description="Drill down into your data with advanced filters across over numerous dimensions."
    >
      <div className="flex flex-wrap justify-center gap-y-3 gap-x-3.5">  
        {FilterOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2 text-base bg-neutral-800 border border-neutral-700 py-1 px-2 rounded-md">
            {option.icon}
            {option.label}
          </div>
        ))}
      </div>
    </Card>
  );
} 