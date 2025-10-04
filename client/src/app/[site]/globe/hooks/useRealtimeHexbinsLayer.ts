import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { LiveSessionLocation } from "../../../../api/analytics/useGetLiveSessionLocations";

interface UseRealtimeHexbinsLayerProps {
  map: React.RefObject<mapboxgl.Map | null>;
  liveSessionLocations: LiveSessionLocation[] | undefined;
  mapLoaded: boolean;
  minutes: number;
}

export function useRealtimeHexbinsLayer({
  map,
  liveSessionLocations,
  mapLoaded,
  minutes,
}: UseRealtimeHexbinsLayerProps) {
  useEffect(() => {
    if (!map.current || !liveSessionLocations || !mapLoaded) return;

    const addHexbinLayer = () => {
      if (!map.current) return;

      const highest = liveSessionLocations.reduce((acc, curr) => Math.max(acc, curr.count), 0) || 1;
      const normalized = 5 / Number(minutes);
      const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([0, highest * normalized * 15]);

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
      if (map.current.getSource("realtime-hexbins")) {
        (map.current.getSource("realtime-hexbins") as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.current.addSource("realtime-hexbins", {
          type: "geojson",
          data: geojsonData,
        });

        // Add hexbin layer (using circle layer for simplicity, can be enhanced with custom hexbin implementation)
        map.current.addLayer({
          id: "realtime-hexbins-layer",
          type: "circle",
          source: "realtime-hexbins",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "count"], 1, 8, highest, 20],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "count"],
              0,
              weightColor(0),
              highest * normalized * 15,
              weightColor(highest * normalized * 15),
            ],
            "circle-opacity": 0.7,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
            "circle-stroke-opacity": 0.3,
          },
          layout: {
            visibility: "none",
          },
        });
      }

      // Update colors when data changes
      if (map.current.getLayer("realtime-hexbins-layer")) {
        map.current.setPaintProperty("realtime-hexbins-layer", "circle-color", [
          "interpolate",
          ["linear"],
          ["get", "count"],
          0,
          weightColor(0),
          highest * normalized * 15,
          weightColor(highest * normalized * 15),
        ]);
      }
    };

    addHexbinLayer();
  }, [liveSessionLocations, mapLoaded, map, minutes]);
}
