import crypto from "crypto";
import { FastifyRequest } from "fastify";
import UAParser, { UAParser as userAgentParser } from "ua-parser-js";
import { z } from "zod";
import { sitesOverLimit } from "../cron/monthly-usage-checker.js";
import { siteConfig } from "../lib/siteConfig.js";
import { trackingPayloadSchema } from "./trackEvent.js";
import { TrackingPayload } from "./types.js";
import { userIdService } from "../services/userId/userIdService.js";

export type TotalTrackingPayload = TrackingPayload & {
  type?: string;
  event_name?: string;
  properties?: string;
  userId: string;
  timestamp: string;
  ua: UAParser.IResult;
  referrer: string;
  ipAddress: string;
};

// Infer type from Zod schema
type ValidatedTrackingPayload = z.infer<typeof trackingPayloadSchema>;

// UTM and URL parameter parsing utilities
export function getUTMParams(querystring: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!querystring) return params;

  try {
    const searchParams = new URLSearchParams(querystring);

    // Extract UTM parameters
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("utm_") || key === "gclid" || key === "gad_source") {
        params[key.toLowerCase()] = value.toLowerCase();
      }
    }
  } catch (e) {
    console.error("Error parsing query string:", e);
  }

  return params;
}

// Parse all URL parameters from querystring
export function getAllUrlParams(querystring: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!querystring) return params;

  // If querystring starts with ?, remove it
  const cleanQuerystring = querystring.startsWith("?")
    ? querystring.substring(1)
    : querystring;

  try {
    const searchParams = new URLSearchParams(cleanQuerystring);
    // Extract all parameters
    for (const [key, value] of searchParams.entries()) {
      params[key.toLowerCase()] = value;
    }
  } catch (e) {
    console.error("Error parsing query string for URL parameters:", e);
  }

  return params;
}

// Clear referrer if it's from the same domain
export function clearSelfReferrer(referrer: string, hostname: string): string {
  if (!referrer || !hostname) return referrer;

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.hostname === hostname) {
      // Internal navigation, clear the referrer
      return "";
    }
  } catch (e) {
    // Invalid URL, return original referrer
  }

  return referrer;
}

// Check if site is over the monthly limit
export function isSiteOverLimit(siteId: number | string): boolean {
  return sitesOverLimit.has(Number(siteId));
}

// Create base tracking payload from request
export function createBasePayload(
  request: FastifyRequest,
  eventType: "pageview" | "custom_event" | "performance" | "error" = "pageview",
  validatedBody: ValidatedTrackingPayload
): TotalTrackingPayload {
  // Use custom user agent if provided, otherwise fall back to header
  const userAgent =
    validatedBody.user_agent || request.headers["user-agent"] || "";
  // Override IP if provided in payload
  const ipAddress = validatedBody.ip_address || getIpAddress(request);
  const siteId = validatedBody.site_id;

  // Use custom user ID if provided, otherwise generate one
  const userId = validatedBody.user_id
    ? validatedBody.user_id.trim()
    : userIdService.generateUserId(ipAddress, userAgent, siteId);

  return {
    ...validatedBody,
    hostname: validatedBody.hostname || "",
    pathname: validatedBody.pathname || "",
    querystring: validatedBody.querystring || "",
    screenWidth: validatedBody.screenWidth || 0,
    screenHeight: validatedBody.screenHeight || 0,
    language: validatedBody.language || "",
    page_title: validatedBody.page_title || "",
    referrer: validatedBody.referrer || "",
    type: eventType,
    ipAddress: ipAddress,
    timestamp: new Date().toISOString(),
    ua: userAgentParser(userAgent),
    userId: userId,
  };
}


// Helper function to get IP address
const getIpAddress = (request: FastifyRequest): string => {
  const cfConnectingIp = request.headers["cf-connecting-ip"];
  if (cfConnectingIp && typeof cfConnectingIp === "string") {
    return cfConnectingIp.trim();
  }

  const forwardedFor = request.headers["x-forwarded-for"];
  if (forwardedFor && typeof forwardedFor === "string") {
    const ips = forwardedFor
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (ips.length > 0) {
      // Return rightmost IP - the last proxy before reaching our server
      // This is the most trustworthy IP in the chain
      return ips[ips.length - 1];
    }
  }

  return request.ip;
};
