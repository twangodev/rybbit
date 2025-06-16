import { FilterParameter } from "@rybbit/shared";
import {
  AppWindow,
  Brain,
  FileText,
  Flag,
  FolderInput,
  Globe,
  Languages,
  Link,
  LogIn,
  LogOut,
  MapPinHouse,
  MapPinned,
  Maximize,
  Megaphone,
  MousePointerClick,
  Puzzle,
  Radio,
  Search,
  Server,
  TabletSmartphone,
  Tag,
  Target,
} from "lucide-react";
import React from "react";

export const FilterOptions: {
  label: string;
  value: FilterParameter;
  icon: React.ReactNode;
}[] = [
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
    label: "Hostname",
    value: "hostname",
    icon: <Server className="h-4 w-4" />,
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
    label: "Operating System Version",
    value: "operating_system_version",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    label: "Browser",
    value: "browser",
    icon: <AppWindow className="h-4 w-4" />,
  },
  {
    label: "Browser Version",
    value: "browser_version",
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
  {
    label: "UTM Campaign",
    value: "utm_campaign",
    icon: <Flag className="h-4 w-4" />,
  },
  {
    label: "UTM Content",
    value: "utm_content",
    icon: <Puzzle className="h-4 w-4" />,
  },
  {
    label: "UTM Term",
    value: "utm_term",
    icon: <Tag className="h-4 w-4" />,
  },
];

export const OperatorOptions = [
  { label: "Is", value: "equals" },
  { label: "Is not", value: "not_equals" },
  { label: "Contains", value: "contains" },
  { label: "Not contains", value: "not_contains" },
];
