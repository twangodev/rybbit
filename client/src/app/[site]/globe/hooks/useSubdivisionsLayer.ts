import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { FilterParameter } from "@rybbit/shared";
import { addFilter } from "../../../../lib/store";

interface UseSubdivisionsLayerProps {
  map: React.RefObject<mapboxgl.Map | null>;
  subdivisionsGeoData: any;
  processedSubdivisionData: any;
  colorScale: (value: number) => string;
  subdivisionData: any;
  setTooltipContent: (content: any) => void;
  mapLoaded: boolean;
  mapView: string;
}

export function useSubdivisionsLayer({
  map,
  subdivisionsGeoData,
  processedSubdivisionData,
  colorScale,
  subdivisionData,
  setTooltipContent,
  mapLoaded,
  mapView,
}: UseSubdivisionsLayerProps) {
  useEffect(() => {
    if (!map.current || !subdivisionsGeoData || !processedSubdivisionData || !mapLoaded) return;

    const addSubdivisionsLayer = () => {
      if (!map.current) return;

      const geoDataCopy = JSON.parse(JSON.stringify(subdivisionsGeoData));
      geoDataCopy.features.forEach((feature: any) => {
        const code = feature.properties?.iso_3166_2;
        const foundData = processedSubdivisionData.find((d: any) => d.value === code);
        const count = foundData?.count || 0;
        const color = count > 0 ? colorScale(count) : "rgba(140, 140, 140, 0.5)";
        feature.properties.fillColor = color;
        feature.properties.count = count;
      });

      if (map.current.getSource("subdivisions")) {
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
            visibility: mapView === "subdivisions" ? "visible" : "none",
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
            visibility: mapView === "subdivisions" ? "visible" : "none",
          },
        });

        map.current.on("mousemove", "subdivisions-fill", (e) => {
          if (!map.current || !e.features || e.features.length === 0) return;
          map.current.getCanvas().style.cursor = "pointer";

          const feature = e.features[0];
          const code = feature.properties?.iso_3166_2;
          const name = feature.properties?.name;
          const count = feature.properties?.count || 0;

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

        map.current.on("click", "subdivisions-fill", (e) => {
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

    addSubdivisionsLayer();
  }, [subdivisionsGeoData, processedSubdivisionData, colorScale, map, subdivisionData, setTooltipContent, mapLoaded]);
}
