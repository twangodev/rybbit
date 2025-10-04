"use client";

import { FilterParameter } from "@rybbit/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { scalePow } from "d3-scale";
import { round } from "lodash";

import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { useSingleCol } from "@/api/analytics/useSingleCol";
import { CountryFlag } from "../components/shared/icons/CountryFlag";
import { useCountries } from "../../../lib/geo";
import { getCountryPopulation } from "../../../lib/countryPopulation";
import { addFilter } from "../../../lib/store";

interface TooltipContent {
  name: string;
  code: string;
  count: number;
  percentage: number;
  perCapita?: number;
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

  const { data: countryData } = useSingleCol({ parameter: "country" });
  const { data: countriesGeoData } = useCountries();

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

  // Create color scale
  const colorScale = useMemo(() => {
    if (!processedCountryData) return () => "#eee";

    const getComputedColor = (cssVar: string) => {
      const hslValues = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return `hsl(${hslValues})`;
    };

    const accentColor = getComputedColor("--accent-400");
    const hslMatch = accentColor.match(/hsl\(([^)]+)\)/);
    const hslValues = hslMatch ? hslMatch[1].split(" ") : ["0", "0%", "50%"];
    const [h, s, l] = hslValues;

    const values = processedCountryData.map((d: any) => d.count);
    const maxValue = Math.max(...values);

    return scalePow<string>()
      .exponent(0.4)
      .domain([0, maxValue])
      .range([`hsla(${h}, ${s}, ${l}, 0.05)`, `hsla(${h}, ${s}, ${l}, 0.8)`]);
  }, [processedCountryData]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Available: streets-v12, outdoors-v12, light-v11, dark-v11, satellite-v9, satellite-streets-v12, navigation-day-v1, navigation-night-v1
      projection: { name: "globe" }, // Options: globe, mercator, naturalEarth, equalEarth, winkelTripel, albers, lambertConformalConic
      zoom: 1.5, // Range: 0-22
      center: [0, 20], // [longitude, latitude]
      pitch: 0, // Range: 0-85 (degrees, 0 = top-down view)
      bearing: 0, // Range: 0-360 (degrees, rotation)
      antialias: true, // Improves rendering quality
    });

    map.current.on("style.load", () => {
      if (!map.current) return;

      map.current.setFog({
        color: "rgb(61, 76, 89)", // Color of atmosphere near horizon
        "high-color": "rgb(36, 92, 223)", // Color of atmosphere away from horizon
        "horizon-blend": 0.01, // Range: 0-1, atmosphere thickness at horizon
        "space-color": "rgb(12, 12, 16)", // Background space color
        "star-intensity": 0.6, // Range: 0-1, brightness of stars
      });

      // Add GeoJSON source and layer when both data are ready
      if (countriesGeoData && processedCountryData) {
        // Create a copy of the GeoJSON data and add color to each feature
        const geoDataCopy = JSON.parse(JSON.stringify(countriesGeoData));
        geoDataCopy.features.forEach((feature: any) => {
          const code = feature.properties?.ISO_A2;
          const foundData = processedCountryData.find((d: any) => d.value === code);
          const count = foundData?.count || 0;
          const color = count > 0 ? colorScale(count) : "rgba(140, 140, 140, 0.5)";
          feature.properties.fillColor = color;
          feature.properties.count = count;
        });

        // Add source
        map.current.addSource("countries", {
          type: "geojson",
          data: geoDataCopy,
        });

        // Add fill layer with data-driven color
        map.current.addLayer({
          id: "countries-fill",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": ["get", "fillColor"],
            "fill-opacity": 0.6,
          },
        });

        // Add outline layer
        map.current.addLayer({
          id: "countries-outline",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.5,
            "line-opacity": 0.3,
          },
        });

        // Add hover layer
        map.current.addLayer({
          id: "countries-hover",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": "transparent",
            "fill-opacity": 0,
          },
          filter: ["==", "ISO_A2", ""],
        });

        // Add hover and click handlers
        map.current.on("mousemove", "countries-fill", e => {
          if (!map.current || !e.features || e.features.length === 0) return;

          map.current.getCanvas().style.cursor = "pointer";

          const feature = e.features[0];
          const code = feature.properties?.ISO_A2;
          const name = feature.properties?.ADMIN;

          const foundData = processedCountryData.find((d: any) => d.value === code);
          const count = foundData?.count || 0;
          const percentage = foundData?.percentage || 0;
          const perCapita = foundData?.perCapita || 0;

          setTooltipContent({
            name,
            code,
            count,
            percentage,
            perCapita,
          });

          // Highlight hovered country
          map.current.setFilter("countries-hover", ["==", "ISO_A2", code]);
        });

        map.current.on("mouseleave", "countries-fill", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
          setTooltipContent(null);
          map.current.setFilter("countries-hover", ["==", "ISO_A2", ""]);
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
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [countriesGeoData, processedCountryData, colorScale]);

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
          <div ref={mapContainer} className="w-full h-full" />
          <div className="absolute bottom-4 left-4 z-99999">
            <div className="flex flex-col p-2 md:p-3 bg-neutral-900 rounded-lg shadow-lg border border-neutral-750 w-[300px] md:w-[400px]">
              fdss
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
