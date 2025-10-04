import { Globe2, HouseIcon, Radio } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MapView = "countries" | "subdivisions" | "realtime";

export default function MapViewSelector({
  mapView,
  setMapView,
}: {
  mapView: MapView;
  setMapView: (mapView: MapView) => void;
}) {
  return (
    <Tabs defaultValue="tab-1">
      <ScrollArea>
        <TabsList className="mb-3">
          <TabsTrigger value="tab-1" onClick={() => setMapView("countries")}>
            <Globe2 className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="tab-2" className="group" onClick={() => setMapView("subdivisions")}>
            <HouseIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Subdivisions
          </TabsTrigger>
          <TabsTrigger value="tab-3" className="group" onClick={() => setMapView("realtime")}>
            <Radio className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Realtime
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
