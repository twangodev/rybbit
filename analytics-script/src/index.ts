import { WebVitalsCollector } from "./webVitals.js";
import {
  patternToRegex,
  findMatchingPattern,
  debounce,
  isOutboundLink,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  collectCustomEventProperties,
} from "./utils.js";
import type {
  RybbitConfig,
  TrackingPayload,
  CustomEventProperties,
  RybbitAPI,
} from "./types.js";

// Main analytics script implementation
(function (): void {
  console.log("IIFE: Starting execution");
  const scriptTag = document.currentScript as HTMLScriptElement;
  console.log("IIFE: scriptTag =", scriptTag);
  if (!scriptTag) {
    console.error("Rybbit: Could not find script tag");
    return;
  }

  const srcAttr = scriptTag.getAttribute("src");
  console.log("IIFE: src attribute =", srcAttr);
  const ANALYTICS_HOST = srcAttr?.split("/script.js")[0];
  console.log("IIFE: ANALYTICS_HOST =", ANALYTICS_HOST);

  // Check if the user has opted out of tracking
  if (
    !!window.__RYBBIT_OPTOUT__ ||
    safeLocalStorageGet("disable-rybbit") !== null
  ) {
    // Create a no-op implementation to ensure the API still works
    window.rybbit = {
      pageview: () => {},
      event: () => {},
      trackOutbound: () => {},
      identify: () => {},
      clearUserId: () => {},
      getUserId: () => null,
    };
    return;
  }

  if (!ANALYTICS_HOST) {
    console.error("Please provide a valid analytics host");
    console.log("IIFE: Exiting due to missing ANALYTICS_HOST");
    return;
  }

  const SITE_ID =
    scriptTag.getAttribute("data-site-id") || scriptTag.getAttribute("site-id");
  console.log("IIFE: SITE_ID =", SITE_ID);

  if (!SITE_ID || isNaN(Number(SITE_ID))) {
    console.error(
      "Please provide a valid site ID using the data-site-id attribute"
    );
    console.log("IIFE: Exiting due to invalid SITE_ID");
    return;
  }

  // Parse configuration from script attributes
  const config: RybbitConfig = {
    siteId: SITE_ID,
    analyticsHost: ANALYTICS_HOST,
    debounceDuration: scriptTag.getAttribute("data-debounce")
      ? Math.max(0, parseInt(scriptTag.getAttribute("data-debounce") || "0"))
      : 500,
    autoTrackPageview:
      scriptTag.getAttribute("data-auto-track-pageview") !== "false",
    autoTrackSpa: scriptTag.getAttribute("data-track-spa") !== "false",
    trackQuerystring: scriptTag.getAttribute("data-track-query") !== "false",
    trackOutbound: scriptTag.getAttribute("data-track-outbound") !== "false",
    // Temporarily enabled for testing - in production this would be:
    // enableWebVitals: scriptTag.getAttribute('data-web-vitals') === 'true',
    enableWebVitals: true,
    skipPatterns: [],
    maskPatterns: [],
  };

  // Parse skip patterns
  try {
    const skipAttr = scriptTag.getAttribute("data-skip-patterns");
    if (skipAttr) {
      const parsed = safeJsonParse(skipAttr, []);
      if (Array.isArray(parsed)) {
        config.skipPatterns = parsed;
      }
    }
  } catch (e) {
    console.error("Error parsing data-skip-patterns:", e);
  }

  // Parse mask patterns
  try {
    const maskAttr = scriptTag.getAttribute("data-mask-patterns");
    if (maskAttr) {
      const parsed = safeJsonParse(maskAttr, []);
      if (Array.isArray(parsed)) {
        config.maskPatterns = parsed;
      }
    }
  } catch (e) {
    console.error("Error parsing data-mask-patterns:", e);
  }

  // User ID management
  let customUserId: string | null = null;

  // Load stored user ID from localStorage on script initialization
  const storedUserId = safeLocalStorageGet("rybbit-user-id");
  if (storedUserId) {
    customUserId = storedUserId;
  }

  // Helper function to create base payload with pattern matching
  const createBasePayload = (): TrackingPayload | null => {
    const url = new URL(window.location.href);
    let pathname = url.pathname;

    // Always handle hash-based SPA routing
    if (url.hash && url.hash.startsWith("#/")) {
      // For #/path format, replace pathname with just /path
      pathname = url.hash.substring(1);
    }

    // Check skip patterns
    if (findMatchingPattern(pathname, config.skipPatterns)) {
      return null; // Indicates tracking should be skipped
    }

    // Apply mask patterns
    const maskMatch = findMatchingPattern(pathname, config.maskPatterns);
    if (maskMatch) {
      pathname = maskMatch;
    }

    const payload: TrackingPayload = {
      site_id: config.siteId,
      hostname: url.hostname,
      pathname: pathname,
      querystring: config.trackQuerystring ? url.search : "",
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      page_title: document.title,
      referrer: document.referrer,
      type: "pageview", // Default type, will be overridden
    };

    // Add custom user ID only if it's set
    if (customUserId) {
      payload.user_id = customUserId;
    }

    return payload;
  };

  // Helper function to send tracking data
  const sendTrackingData = (payload: Partial<TrackingPayload>): void => {
    fetch(`${config.analyticsHost}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
      keepalive: true,
    }).catch(console.error);
  };

  // Main tracking function
  const track = (
    eventType: TrackingPayload["type"] = "pageview",
    eventName = "",
    properties: CustomEventProperties = {}
  ): void => {
    if (
      eventType === "custom_event" &&
      (!eventName || typeof eventName !== "string")
    ) {
      console.error(
        "Event name is required and must be a string for custom events"
      );
      return;
    }

    const basePayload = createBasePayload();
    if (!basePayload) {
      return; // Skip tracking due to pattern match
    }

    const payload: Partial<TrackingPayload> = {
      ...basePayload,
      type: eventType,
      event_name: eventName,
      properties:
        eventType === "custom_event" || eventType === "outbound"
          ? JSON.stringify(properties)
          : undefined,
    };

    sendTrackingData(payload);
  };

  // Initialize Web Vitals if enabled
  let webVitalsCollector: WebVitalsCollector | null = null;
  if (config.enableWebVitals) {
    webVitalsCollector = new WebVitalsCollector(sendTrackingData);
    webVitalsCollector.init();
  }

  // Pageview tracking
  const trackPageview = (): void => track("pageview");

  const debouncedTrackPageview =
    config.debounceDuration > 0
      ? debounce(trackPageview, config.debounceDuration)
      : trackPageview;

  // Track outbound link clicks and custom data-attribute events
  document.addEventListener("click", function (e: MouseEvent): void {
    // First check for custom events via data attributes
    let target = e.target as Element | null;
    while (target && target !== document.documentElement) {
      if (target.hasAttribute("data-rybbit-event")) {
        const eventName = target.getAttribute("data-rybbit-event");
        if (eventName) {
          // Collect additional properties from data-rybbit-prop-* attributes
          const properties = collectCustomEventProperties(target);
          track("custom_event", eventName, properties);
        }
        break;
      }
      target = target.parentElement;
    }

    // Then check for outbound links
    if (config.trackOutbound) {
      const link = (e.target as Element).closest("a") as HTMLAnchorElement;
      if (!link || !link.href) return;

      if (isOutboundLink(link.href)) {
        track("outbound", "", {
          url: link.href,
          text: link.innerText || link.textContent || "",
          target: link.target || "_self",
        });
      }
    }
  });

  // SPA tracking setup
  if (config.autoTrackSpa) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (
      ...args: Parameters<typeof history.pushState>
    ): void {
      originalPushState.apply(this, args);
      debouncedTrackPageview();
    };

    history.replaceState = function (
      ...args: Parameters<typeof history.replaceState>
    ): void {
      originalReplaceState.apply(this, args);
      debouncedTrackPageview();
    };

    window.addEventListener("popstate", debouncedTrackPageview);
    // Always listen for hashchange events for hash-based routing
    window.addEventListener("hashchange", debouncedTrackPageview);
  }

  // Create the public API
  const rybbitAPI: RybbitAPI = {
    pageview: trackPageview,
    event: (name: string, properties: CustomEventProperties = {}): void =>
      track("custom_event", name, properties),
    trackOutbound: (url: string, text = "", target = "_self"): void =>
      track("outbound", "", { url, text, target }),

    // User identification methods
    identify: (userId: string): void => {
      if (typeof userId !== "string" || userId.trim() === "") {
        console.error("User ID must be a non-empty string");
        return;
      }
      customUserId = userId.trim();
      safeLocalStorageSet("rybbit-user-id", customUserId);
    },

    clearUserId: (): void => {
      customUserId = null;
      safeLocalStorageRemove("rybbit-user-id");
    },

    getUserId: (): string | null => customUserId,
  };

  // Expose the API globally
  console.log("IIFE: Setting up window.rybbit API");
  window.rybbit = rybbitAPI;
  console.log("IIFE: window.rybbit =", window.rybbit);

  // Auto-track initial pageview if enabled
  if (config.autoTrackPageview) {
    console.log("IIFE: Auto-tracking pageview");
    trackPageview();
  }
  console.log("IIFE: Execution completed successfully");
})();
