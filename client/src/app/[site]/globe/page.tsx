"use client";

import { FilterParameter } from "@rybbit/shared";
import { scalePow } from "d3-scale";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSingleCol } from "@/api/analytics/useSingleCol";
import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { getCountryPopulation } from "../../../lib/countryPopulation";
import { useCountries, useSubdivisions } from "../../../lib/geo";
import { addFilter } from "../../../lib/store";
import { CountryFlag } from "../components/shared/icons/CountryFlag";
import { SubHeader } from "../components/SubHeader/SubHeader";
import MapViewSelector, { MapView } from "./components/ModeSelector";

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

export default function GlobePage() {
  useSetPageTitle("Rybbit · Globe");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [tooltipContent, setTooltipContent] = useState<TooltipContent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [mapView, setMapView] = useState<MapView>("countries");
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: countryData } = useSingleCol({ parameter: "country" });
  const { data: subdivisionData } = useSingleCol({ parameter: "region", limit: 10000 });

  const { data: countriesGeoData } = useCountries();
  const { data: subdivisionsGeoData } = useSubdivisions();

  // Process data to include per capita metrics
  const processedCountryData = useMemo(() => {
    if (!countryData?.data) return null;

    return countryData.data.map((item: any) => {
      const population = getCountryPopulation(item.value);
      const perCapitaValue = population > 0 ? item.count / population : 0;
      return {
        ...item,
        perCapita: perCapitaValue,
      };
    });
  }, [countryData?.data]);

  const processedSubdivisionData = useMemo(() => {
    if (!subdivisionData?.data) return null;

    return subdivisionData.data.map((item: any) => {
      const countryCode = item.value?.split("-")[0];
      const population = getCountryPopulation(countryCode);
      const perCapitaValue = population > 0 ? item.count / (population / 10) : 0;
      return {
        ...item,
        perCapita: perCapitaValue,
      };
    });
  }, [subdivisionData?.data]);

  // Create color scale
  const colorScale = useMemo(() => {
    const dataToUse = mapView === "countries" ? processedCountryData : processedSubdivisionData;
    if (!dataToUse) return () => "#eee";

    const getComputedColor = (cssVar: string) => {
      const hslValues = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return `hsl(${hslValues})`;
    };

    const accentColor = getComputedColor("--accent-400");
    const hslMatch = accentColor.match(/hsl\(([^)]+)\)/);
    const hslValues = hslMatch ? hslMatch[1].split(" ") : ["0", "0%", "50%"];
    const [h, s, l] = hslValues;

    const values = dataToUse.map((d: any) => d.count);
    const maxValue = Math.max(...values);

    return scalePow<string>()
      .exponent(0.4)
      .domain([0, maxValue])
      .range([`hsla(${h}, ${s}, ${l}, 0.05)`, `hsla(${h}, ${s}, ${l}, 0.8)`]);
  }, [processedCountryData, processedSubdivisionData, mapView]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      projection: { name: "globe" },
      zoom: 1.5,
      center: [0, 20],
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
    });

    map.current.on("style.load", () => {
      if (!map.current) return;

      map.current.setFog({
        color: "rgb(61, 76, 89)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.01,
        "space-color": "rgb(12, 12, 16)",
        "star-intensity": 0.6,
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update countries layer
  useEffect(() => {
    if (!map.current || !countriesGeoData || !processedCountryData) return;

    const addCountriesLayer = () => {
      if (!map.current) return;

      const geoDataCopy = JSON.parse(JSON.stringify(countriesGeoData));
      geoDataCopy.features.forEach((feature: any) => {
        const code = feature.properties?.ISO_A2;
        const foundData = processedCountryData.find((d: any) => d.value === code);
        const count = foundData?.count || 0;
        const color = count > 0 ? colorScale(count) : "rgba(140, 140, 140, 0.5)";
        feature.properties.fillColor = color;
        feature.properties.count = count;
      });

      if (map.current.getSource("countries")) {
        (map.current.getSource("countries") as mapboxgl.GeoJSONSource).setData(geoDataCopy);
      } else {
        map.current.addSource("countries", {
          type: "geojson",
          data: geoDataCopy,
        });

        map.current.addLayer({
          id: "countries-fill",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": ["get", "fillColor"],
            "fill-opacity": 0.6,
          },
          layout: {
            visibility: "visible",
          },
        });

        map.current.addLayer({
          id: "countries-outline",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.5,
            "line-opacity": 0.3,
          },
          layout: {
            visibility: "visible",
          },
        });

        map.current.on("mousemove", "countries-fill", e => {
          if (!map.current || !e.features || e.features.length === 0) return;
          map.current.getCanvas().style.cursor = "pointer";

          const feature = e.features[0];
          const code = feature.properties?.ISO_A2;
          const name = feature.properties?.ADMIN;
          const count = feature.properties?.count || 0;

          // Get percentage from current data
          const currentData = countryData?.data;
          const foundData = currentData?.find((d: any) => d.value === code);
          const percentage = foundData?.percentage || 0;

          setTooltipContent({
            name,
            code,
            count,
            percentage,
          });
        });

        map.current.on("mouseleave", "countries-fill", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
          setTooltipContent(null);
        });

        map.current.on("click", "countries-fill", e => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const code = feature.properties?.ISO_A2;

          addFilter({
            parameter: "country" as FilterParameter,
            value: [code],
            type: "equals",
          });
        });
      }
    };

    // Just call it directly - the function will handle whether source exists or not
    addCountriesLayer();
  }, [countriesGeoData, processedCountryData, colorScale]);

  // Add/update subdivisions layer
  useEffect(() => {
    if (!map.current || !subdivisionsGeoData || !processedSubdivisionData) return;

    const addSubdivisionsLayer = () => {
      if (!map.current) {
        return;
      }

      const geoDataCopy = JSON.parse(JSON.stringify(subdivisionsGeoData));
      geoDataCopy.features.forEach((feature: any) => {
        const code = feature.properties?.iso_3166_2;
        const foundData = processedSubdivisionData.find((d: any) => d.value === code);
        const count = foundData?.count || 0;
        const color = count > 0 ? colorScale(count) : "rgba(140, 140, 140, 0.5)";
        feature.properties.fillColor = color;
        feature.properties.count = count;
      });

      const hasSource = !!map.current.getSource("subdivisions");

      if (hasSource) {
        (map.current.getSource("subdivisions") as mapboxgl.GeoJSONSource).setData(geoDataCopy);
      } else {
        map.current.addSource("subdivisions", {
          type: "geojson",
          data: geoDataCopy,
        });

        map.current.addLayer({
          id: "subdivisions-fill",
          type: "fill",
          source: "subdivisions",
          paint: {
            "fill-color": ["get", "fillColor"],
            "fill-opacity": 0.6,
          },
          layout: {
            visibility: "none",
          },
        });

        map.current.addLayer({
          id: "subdivisions-outline",
          type: "line",
          source: "subdivisions",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.5,
            "line-opacity": 0.3,
          },
          layout: {
            visibility: "none",
          },
        });

        map.current.on("mousemove", "subdivisions-fill", e => {
          if (!map.current || !e.features || e.features.length === 0) return;
          map.current.getCanvas().style.cursor = "pointer";

          const feature = e.features[0];
          const code = feature.properties?.iso_3166_2;
          const name = feature.properties?.name;
          const count = feature.properties?.count || 0;

          // Get percentage from current data
          const currentData = subdivisionData?.data;
          const foundData = currentData?.find((d: any) => d.value === code);
          const percentage = foundData?.percentage || 0;

          setTooltipContent({
            name,
            code,
            count,
            percentage,
          });
        });

        map.current.on("mouseleave", "subdivisions-fill", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
          setTooltipContent(null);
        });

        map.current.on("click", "subdivisions-fill", e => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const code = feature.properties?.iso_3166_2;

          addFilter({
            parameter: "region" as FilterParameter,
            value: [code],
            type: "equals",
          });
        });
      }
    };

    // Just call it directly - the function will handle whether source exists or not
    addSubdivisionsLayer();
  }, [subdivisionsGeoData, processedSubdivisionData, colorScale, mapLoaded]);

  // Toggle layer visibility when mapView changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (map.current.getLayer("countries-fill")) {
      const countriesVisibility = mapView === "countries" ? "visible" : "none";
      map.current.setLayoutProperty("countries-fill", "visibility", countriesVisibility);
    }
    if (map.current.getLayer("countries-outline")) {
      const countriesVisibility = mapView === "countries" ? "visible" : "none";
      map.current.setLayoutProperty("countries-outline", "visibility", countriesVisibility);
    }
    if (map.current.getLayer("subdivisions-fill")) {
      const subdivisionsVisibility = mapView === "subdivisions" ? "visible" : "none";
      map.current.setLayoutProperty("subdivisions-fill", "visibility", subdivisionsVisibility);
    }
    if (map.current.getLayer("subdivisions-outline")) {
      const subdivisionsVisibility = mapView === "subdivisions" ? "visible" : "none";
      map.current.setLayoutProperty("subdivisions-outline", "visibility", subdivisionsVisibility);
    }
  }, [mapView, mapLoaded]);

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
          <div className="absolute bottom-4 left-4 z-99999">
            <div className="flex flex-col p-2 md:p-3 bg-neutral-900 rounded-lg shadow-lg border border-neutral-750 w-[300px] md:w-[400px]">
              <MapViewSelector mapView={mapView} setMapView={setMapView} />
            </div>
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
      </div>
    </DisabledOverlay>
  );
}
