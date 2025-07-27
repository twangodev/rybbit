import { config } from "dotenv";

// Load environment variables
config();

export const CONFIG = {
  // Server configuration
  PORT: parseInt(process.env.PORT || "3003", 10),
  HOST: process.env.HOST || "0.0.0.0",

  // Region identifier
  REGION: process.env.REGION || "unknown",
  REGION_NAME: process.env.REGION_NAME || "Unknown Region",

  // Main Server
  MAIN_SERVER_URL: process.env.MAIN_SERVER_URL || "",

  // Security - IP whitelist for main server
  ALLOWED_IPS: process.env.ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [],
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10), // 1 minute

  // Monitoring defaults
  DEFAULT_TIMEOUT_MS: parseInt(process.env.DEFAULT_TIMEOUT_MS || "30000", 10),
  MAX_TIMEOUT_MS: parseInt(process.env.MAX_TIMEOUT_MS || "60000", 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Health check
  HEALTH_CHECK_INTERVAL_MS: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || "30000", 10),
};

// Validate required configuration
export function validateConfig(): void {
  const required = ["REGION"];
  const missing = required.filter((key) => !CONFIG[key as keyof typeof CONFIG]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Warn if no IP whitelist is configured
  if (CONFIG.ALLOWED_IPS.length === 0) {
    console.warn("WARNING: No IP whitelist configured. Agent will accept requests from any IP address.");
  }
}
