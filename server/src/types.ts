// Minimal context type for client builds
export type Context = {
  req: any;
  res: any;
  user: { id: string; name: string; bio?: string } | null;
};

// Re-export AppRouter type (now safe since router.ts imports Context from here)
export type { AppRouter } from "./router.js";

export interface TrackingPayload {
  site_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  timestamp: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  page_title: string;
  referrer: string;
}
