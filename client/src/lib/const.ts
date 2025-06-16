export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL === "http://localhost:3001"
    ? "http://localhost:3001/api"
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
export const IS_CLOUD = process.env.NEXT_PUBLIC_CLOUD === "true";
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

// Time constants
export const MINUTES_IN_24_HOURS = 24 * 60; // 1440 minutes
