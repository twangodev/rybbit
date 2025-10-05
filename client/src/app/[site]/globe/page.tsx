"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useMemo, useRef, useState } from "react";

import { useSingleCol } from "@/api/analytics/useSingleCol";
import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { useCountries, useSubdivisions } from "../../../lib/geo";
import { CountryFlag } from "../components/shared/icons/CountryFlag";
import { SubHeader } from "../components/SubHeader/SubHeader";
import MapViewSelector, { MapView } from "./components/ModeSelector";
import { useMapbox } from "./hooks/useMapbox";
import { useCountriesLayer } from "./hooks/useCountriesLayer";
import { useSubdivisionsLayer } from "./hooks/useSubdivisionsLayer";
import { useLayerVisibility } from "./hooks/useLayerVisibility";
import { useCoordinatesLayer } from "./hooks/useCoordinatesLayer";
import { createColorScale } from "./utils/colorScale";
import { processCountryData, processSubdivisionData } from "./utils/processData";
import { useGetLiveSessionLocations } from "../../../api/analytics/useGetLiveSessionLocations";
import { GlobeSessions } from "./components/GlobeSessions";

interface TooltipContent {
  name: string;
  code: string;
  count: number;
  percentage: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

interface PopoverContent {
  city: string;
  count: number;
  lat: number;
  lng: number;
}

interface PopoverPosition {
  x: number;
  y: number;
}

export default function GlobePage() {
  useSetPageTitle("Rybbit · Globe");
  const mapContainer = useRef<HTMLDivElement>(null);

  const [tooltipContent, setTooltipContent] = useState<TooltipContent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [popoverContent, setPopoverContent] = useState<PopoverContent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ x: 0, y: 0 });
  const [mapView, setMapView] = useState<MapView>("coordinates");

  const { data: countryData } = useSingleCol({ parameter: "country" });
  const { data: subdivisionData } = useSingleCol({ parameter: "region", limit: 10000 });
  const { data: liveSessionLocations } = useGetLiveSessionLocations();

  const { data: countriesGeoData } = useCountries();
  const { data: subdivisionsGeoData } = useSubdivisions();

  const processedCountryData = useMemo(() => processCountryData(countryData), [countryData]);
  const processedSubdivisionData = useMemo(() => processSubdivisionData(subdivisionData), [subdivisionData]);

  const colorScale = useMemo(() => {
    const dataToUse = mapView === "countries" ? processedCountryData : processedSubdivisionData;
    return createColorScale(dataToUse);
  }, [processedCountryData, processedSubdivisionData, mapView]);

  const { map, mapLoaded } = useMapbox(mapContainer);

  useCountriesLayer({
    map,
    countriesGeoData,
    processedCountryData,
    colorScale,
    countryData,
    setTooltipContent,
    mapLoaded,
    mapView,
  });

  useSubdivisionsLayer({
    map,
    subdivisionsGeoData,
    processedSubdivisionData,
    colorScale,
    subdivisionData,
    setTooltipContent,
    mapLoaded,
    mapView,
  });

  useCoordinatesLayer({
    map,
    liveSessionLocations,
    mapLoaded,
    minutes: 30,
    setPopoverContent,
    setPopoverPosition,
    setTooltipContent,
    mapView,
  });

  useLayerVisibility(map, mapView, mapLoaded);

  return (
    <DisabledOverlay message="Globe" featurePath="globe">
      <div
        className="relative w-full h-dvh"
        onMouseMove={e => {
          if (tooltipContent) {
            setTooltipPosition({
              x: e.clientX,
              y: e.clientY,
            });
          }
        }}
      >
        <div className="p-2 md:p-4 relative z-50">
          <SubHeader />
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 z-10">
          <div
            ref={mapContainer}
            className="w-full h-full [&_.mapboxgl-ctrl-bottom-left]:!hidden [&_.mapboxgl-ctrl-logo]:!hidden"
          />
          <div className="absolute bottom-0 left-4 z-99999">
            <MapViewSelector mapView={mapView} setMapView={setMapView} />
          </div>
          <div className="absolute top-[105px] left-4 z-99999">
            <GlobeSessions />
          </div>
        </div>
        {tooltipContent && (
          <div
            className="fixed z-50 bg-neutral-1000 text-white rounded-md p-2 shadow-lg text-sm pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-sm flex items-center gap-1">
              {tooltipContent.code && <CountryFlag country={tooltipContent.code.slice(0, 2)} />}
              {tooltipContent.name}
            </div>
            <div>
              <span className="font-bold text-accent-400">{tooltipContent.count.toLocaleString()}</span>{" "}
              <span className="text-neutral-300">({tooltipContent.percentage.toFixed(1)}%) sessions</span>
            </div>
          </div>
        )}
        {popoverContent && (
          <div className="absolute bottom-4 right-4 z-50">
            <div className="flex flex-col p-2 md:p-3 bg-neutral-900 rounded-lg shadow-lg border border-neutral-750 w-[300px] md:w-[400px]">
              <button
                onClick={() => setPopoverContent(null)}
                className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                ✕
              </button>
              <div className="font-semibold text-base mb-2">{popoverContent.city}</div>
              <div className="space-y-1">
                <div>
                  <span className="text-neutral-400">Visitors: </span>
                  <span className="font-bold text-accent-400">{popoverContent.count.toLocaleString()}</span>
                </div>
                <div className="text-xs text-neutral-400">
                  <div>Lat: {popoverContent.lat.toFixed(4)}</div>
                  <div>Lng: {popoverContent.lng.toFixed(4)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DisabledOverlay>
  );
}
