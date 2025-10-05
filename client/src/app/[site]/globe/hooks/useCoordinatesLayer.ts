import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { LiveSessionLocation } from "../../../../api/analytics/useGetSessionLocations";
import { addFilter } from "../../../../lib/store";
import { FilterParameter } from "@rybbit/shared/dist/filters";
import { round } from "lodash";

const getSizeMultiplier = (total: number) => {
  if (total <= 50) return 3; // Large dots
  if (total <= 200) return 2; // Medium dots
  if (total <= 500) return 1.5; // Small-medium dots
  return 1; // Small dots
};

export function useCoordinatesLayer({
  map,
  liveSessionLocations,
  mapLoaded,
  minutes,
  setTooltipContent,
  mapView,
}: {
  map: React.RefObject<mapboxgl.Map | null>;
  liveSessionLocations: LiveSessionLocation[] | undefined;
  mapLoaded: boolean;
  minutes: number;
  setTooltipContent: (content: any) => void;
  mapView: string;
}) {
  useEffect(() => {
    if (!map.current || !liveSessionLocations || !mapLoaded) return;

    const addCoordinatesLayer = () => {
      if (!map.current) return;

      const highest = liveSessionLocations.reduce((acc, curr) => Math.max(acc, curr.count), 0) || 1;
      const normalized = 5 / Number(minutes);
      const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([0, highest * normalized * 15]);
      const singleColor = weightColor(0); // Use the start color for all hexbins

      // Calculate size scale based on total number of locations
      const totalLocations = liveSessionLocations.length;

      const sizeMultiplier = getSizeMultiplier(totalLocations);

      // Create GeoJSON points from live session locations
      const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: "FeatureCollection",
        features: liveSessionLocations.map(location => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [location.lon, location.lat],
          },
          properties: {
            count: location.count,
            city: location.city,
          },
        })),
      };

      // Add or update source
      if (map.current.getSource("realtime-coordinates")) {
        (map.current.getSource("realtime-coordinates") as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.current.addSource("realtime-coordinates", {
          type: "geojson",
          data: geojsonData,
        });

        // Add hexbin layer (using circle layer for simplicity, can be enhanced with custom hexbin implementation)
        map.current.addLayer({
          id: "realtime-coordinates-layer",
          type: "circle",
          source: "realtime-coordinates",
          paint: {
            "circle-radius": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              0,
              ["interpolate", ["linear"], ["get", "count"], 1, 1 * sizeMultiplier, highest, 3 * sizeMultiplier],
              5,
              ["interpolate", ["linear"], ["get", "count"], 1, 3 * sizeMultiplier, highest, 7 * sizeMultiplier],
              10,
              ["interpolate", ["linear"], ["get", "count"], 1, 7 * sizeMultiplier, highest, 15 * sizeMultiplier],
              15,
              ["interpolate", ["linear"], ["get", "count"], 1, 15 * sizeMultiplier, highest, 30 * sizeMultiplier],
            ],
            // "circle-radius": [
            //   "interpolate",
            //   ["exponential", 2],
            //   ["zoom"],
            //   0,
            //   ["interpolate", ["linear"], ["get", "count"], 1, 1 * sizeMultiplier, highest, 3 * sizeMultiplier],
            //   5,
            //   ["interpolate", ["linear"], ["get", "count"], 1, 2 * sizeMultiplier, highest, 5 * sizeMultiplier],
            //   10,
            //   ["interpolate", ["linear"], ["get", "count"], 1, 4 * sizeMultiplier, highest, 10 * sizeMultiplier],
            //   15,
            //   ["interpolate", ["linear"], ["get", "count"], 1, 8 * sizeMultiplier, highest, 20 * sizeMultiplier],
            // ],
            "circle-color": singleColor,
            "circle-opacity": 0.7,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
            "circle-stroke-opacity": 0.3,
          },
          layout: {
            visibility: mapView === "coordinates" ? "visible" : "none",
          },
        });

        // Add mouse events for tooltip and popover
        map.current.on("mouseenter", "realtime-coordinates-layer", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mousemove", "realtime-coordinates-layer", e => {
          if (!map.current || !e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const city = feature.properties?.city || "Unknown";
          const count = feature.properties?.count || 0;

          setTooltipContent({
            name: city,
            code: "",
            count,
            percentage: 0,
          });
        });

        map.current.on("mouseleave", "realtime-coordinates-layer", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
          setTooltipContent(null);
        });

        map.current.on("click", "realtime-coordinates-layer", e => {
          if (!map.current || !e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const city = feature.properties?.city || "Unknown";
          const count = feature.properties?.count || 0;

          // Get the feature's coordinates
          const coordinates = (feature.geometry as any).coordinates.slice().map((c: number) => round(c, 4));

          addFilter({
            parameter: "lat" as FilterParameter,
            value: [coordinates[1]],
            type: "equals",
          });

          addFilter({
            parameter: "lon" as FilterParameter,
            value: [coordinates[0]],
            type: "equals",
          });
        });
      }

      // Update colors when data changes
      if (map.current.getLayer("realtime-coordinates-layer")) {
        map.current.setPaintProperty("realtime-coordinates-layer", "circle-color", singleColor);
      }
    };

    addCoordinatesLayer();
  }, [liveSessionLocations, mapLoaded, map, minutes, setTooltipContent]);
}
