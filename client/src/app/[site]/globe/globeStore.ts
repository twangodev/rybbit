import { create } from "zustand";
import { MapView } from "./components/ModeSelector";

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

interface GlobeStore {
  tooltipContent: TooltipContent | null;
  tooltipPosition: TooltipPosition;
  mapView: MapView;
  setTooltipContent: (content: TooltipContent | null) => void;
  setTooltipPosition: (position: TooltipPosition) => void;
  setMapView: (view: MapView) => void;
}

export const useGlobeStore = create<GlobeStore>(set => ({
  tooltipContent: null,
  tooltipPosition: { x: 0, y: 0 },
  mapView: "coordinates",
  setTooltipContent: content => set({ tooltipContent: content }),
  setTooltipPosition: position => set({ tooltipPosition: position }),
  setMapView: view => set({ mapView: view }),
}));
